class Compiler
  def initialize
    @source_lines = []
    @object_lines = []
    @symbols = {}
    @labels = {}
    @address = 0
  end

  def resolve_symbols(part)
    @symbols.each { |k, v| part.gsub!(k, v) } 
    part
  end

  def resolve_labels(part)
    @labels.each { |k, v| part.gsub!(k, "$#{v.to_s(16)}") }
    part
  end

  def pass_one
    File.open("./hello.src", 'r') do |file|
      file.each do |line|
        parts = line.split(' ')

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
          operand = resolve_symbols(parts[1]) unless parts[1].nil?

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
          operand = resolve_symbols(parts[2]) unless parts[2].nil?

          @source_lines << {}.tap do |line|
            line[:label]   = parts[0]
            line[:opcode]  = opcode.strip unless opcode.nil?
            line[:operand] = operand unless operand.nil?
          end
        else
          @source_lines << line if line == "\n"
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
    else
      (opcode[0] == 'b' && opcode[1] != 'i') ? 2 : 3 # relative : absolute
    end
  end

  def pass_two
    @source_lines.each do |line|
      if line.is_a? String
        @object_lines << line
      else
        if line[:set_address].to_i > 0
          @address = line[:set_address]
        else
          @labels[line[:label]] = @address unless line[:label].nil?
          
          if line[:opcode]
            @object_lines << ". #{@address.to_s(16)} #{line[:opcode]} #{line[:operand]}".strip
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
    @object_lines.each do |line|
      # if line.is_a? String
        puts line
      # else
      #   puts ". #{line[:label]} #{line[:instruction]}".strip
      # end
    end
    puts @labels.inspect
  end
end

c = Compiler.new
puts c.inspect
c.pass_one
c.pass_two
c.pass_three
c.write_object_code
puts 'Done.'
