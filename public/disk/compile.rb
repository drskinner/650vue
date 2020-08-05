class Compiler
  def initialize
    @source_lines = []
    @object_lines = []
    @symbols = {}
    @labels = {}
    @address = 0
    @stringLabel = ''

    if ARGV[0]
      @filename = ARGV[0]
    else
      puts 'Usage: ruby compile.rb <filename>'
      exit
    end
  end

  # Have to do this funky key sort because any symbol/label
  # can be a substring of another
  def resolve_symbols(part)
    @symbols.sort_by {|k, _| k.length }.reverse.each { |k, v| part.gsub!(k, v) } 
    part
  end

  def resolve_labels(line)
    @labels.sort_by {|k, _| k.length }.reverse.each { |k, v| line.gsub!(k, "$#{v.to_s(16)}") }
    parts = line.split(' ')
    if parts[3].nil?
      line
    else
      if parts[3].match(/#<\$(\d|[a-f]){4}$/)
        parts[3] = "#$#{parts[3][5..6]}"
      elsif parts[3].match(/#>\$(\d|[a-f]){4}$/)
        parts[3] = "#$#{parts[3][3..4]}"
      end
      "#{parts.join(' ')}\n"
    end
  end

  def pass_one
    File.open("./#{@filename}.src", 'r') do |file|
      file.each do |line|
        parts = line.split(' ')
        macro = false

        case line[0]
        when ':'
          @symbols[parts[0]] = parts[2]
        when '*'
          address = parts[2].gsub('$', '').to_i(16)
          @source_lines << {}.tap do |line|
            line[:set_address] = address
          end
        when ' '
          opcode = parts[0]
          if opcode == '!str'
            operand = line.match(/`(.*?)`/).to_s.gsub('`', '') + "\0"
          elsif opcode == '!chr'
            operand = line.match(/`(.*?)`/).to_s.gsub('`', '')
          elsif opcode == '!res'
            count = line.match(/(\d|[a-f]){2}/).to_s.to_i(16)
            operand = ''
            count.times do
              operand << "\0"
            end
          elsif opcode == '@setStr'
            macro = true
            opcode = 'lda'
            @stringLabel = parts[1]
            operand = "#<#{@stringLabel}"
          else
            operand = resolve_symbols(parts[1]) unless parts[1].nil? || parts[1][0] == ';'
          end

          @source_lines << {}.tap do |line|
            line[:opcode]  = opcode.strip
            line[:operand] = operand
          end
        when ';'
          @source_lines << line
        when '>'
          @source_lines << line
        when /\p{Alpha}/
          opcode = parts[1]
          if opcode == '!str'
            operand = line.match(/`(.*?)`/).to_s.gsub('`', '') + "\0"
          elsif opcode == '!chr'
            operand = line.match(/`(.*?)`/).to_s.gsub('`', '')
          elsif opcode == '!res'
            count = line.match(/(\d|[a-f]){2}/).to_s.to_i(16)
            operand = ''
            count.times do
              operand << "\0"
            end
          elsif opcode == '@setStr'
            macro = true
            opcode = 'lda'
            @stringLabel = parts[2]
            operand = "#<#{@stringLabel}"
          else
            operand = resolve_symbols(parts[2]) unless parts[2].nil? || parts[2][0] == ';'
          end

          @source_lines << {}.tap do |line|
            line[:label]   = parts[0]
            line[:opcode]  = opcode.strip unless opcode.nil?
            line[:operand] = operand unless operand.nil?
          end
        else
          @source_lines << line if line == "\n"
        end

        # this is a cheap hack for now
        if macro
          @source_lines << { opcode: 'sta', operand: resolve_symbols(':string_ptr_lo') }
          @source_lines << { opcode: 'lda', operand: "#>#{@stringLabel}" }
          @source_lines << { opcode: 'sta', operand: resolve_symbols(':string_ptr_hi') }
          macro = false
        end
      end
    end
  end

  def bytes(opcode, operand)
    if operand.nil?
      1 # implied
    elsif operand.match(/#\$(\d|[a-f]){2}$/)
      2 # immediate
    elsif operand.match(/\$(\d|[a-f]){4}$/)
      (opcode[0] == 'b' && opcode[1] != 'i') ? 2 : 3 # relative : absolute
    elsif operand.match(/\$(\d|[a-f]){4},x$/) || operand.match(/\$(\d|[a-f]){4},y$/)
      3 # absolute,x || absolute,y
    elsif operand.match(/\$(\d|[a-f]){2}$/)
      2 # zero-page
    elsif operand.match(/\$(\d|[a-f]){2},x$/) || operand.match(/\$(\d|[a-f]){2},y$/)
      2 # zero-page,x || zero-page,y
    elsif operand.match(/\(\$(\d|[a-f]){4}\)$/)
      3 # indirect
    elsif operand.match(/\(\$(\d|[a-f]){2}\),y$/)
      2 # indirect, indexed
    elsif operand.match(/\(\$(\d|[a-f]){2},x\)$/)
      2 # indexed, indirect
    elsif operand.match(/[<>]/)
      2 # msb/lsb of a 16-bit
    else
      (opcode[0] == 'b' && opcode[1] != 'i') ? 2 : 3 # relative : absolute
    end
  end

  def string_to_memory(part)
    part.scan(/.{1,8}/).each do |chunk|
      my_string = "> #{@address.to_s(16)}"
      chunk.chars.each { |char| my_string << " #{'%02X' % char.ord}" }
      @object_lines << "#{my_string}\n"
      @address += chunk.size
    end
  end

  def pass_two
    @source_lines.each do |line|
      if line.is_a? String
        @object_lines << line
      else
        if line[:set_address].to_i > 0
          @address = line[:set_address]
        elsif %w[!str !chr !res].include?(line[:opcode])
          @labels[line[:label]] = @address unless line[:label].nil?
          string_to_memory(line[:operand])
        else
          @labels[line[:label]] = @address unless line[:label].nil?

          i = line[:operand].index('+') if line[:operand]
          if i
            value = line[:operand][i-4..i-1].to_i(16) + line[:operand][i+1..].to_i(16)
            line[:operand] = line[:operand][0..i-5] + value.to_s(16)
          end

          if line[:opcode]
            @object_lines << ". #{@address.to_s(16)} #{line[:opcode]} #{line[:operand]}".strip + "\n"
            @address += bytes(line[:opcode], line[:operand])
          end
        end
      end
    end
  end

  def pass_three
    @object_lines.map! { |line| resolve_labels(line) }
  end

  def write_object_code
    File.open("./#{@filename}.obj", 'w') do |file|
      @object_lines.each do |line|
        file.write line
      end
    end
  end
end

c = Compiler.new
c.pass_one
c.pass_two
c.pass_three
c.write_object_code
