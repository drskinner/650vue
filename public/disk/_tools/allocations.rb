#------------------------------------------------------------------------------
# 650Vue Assembler - Allocations
#
# The Allocations object takes the parsed source code and assigns each line to
# a memory location, additionally building a lookup table of labels and memory
# locations as it goes.
#------------------------------------------------------------------------------

class Allocations
  def initialize(lines)
    @source_lines = lines
    @object_lines = []
    @labels = {}
    @address = 0
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

  def allocate_memory
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

          if line[:opcode]
            @object_lines << ". #{'%04x' % @address} #{line[:opcode]} #{line[:operand]}".strip + "\n"
            @address += bytes(line[:opcode], line[:operand])
          else
            @object_lines << line if line.start_with? "\n"
          end
        end
      end
    end

    @object_lines
  end


  def get_labels
    @labels
  end
end
