#------------------------------------------------------------------------------
# 650Vue Assembler - Parser
#
# The Parser scans the source code and prepares each line, separating it
# into label, opcode, and operand. Lines that are not valid 6502 assembly 
# instructions are left untouched.
#------------------------------------------------------------------------------

class Parser
  def initialize(lines)
    @source_lines = lines
    @object_lines = []
    @address = 0
  end

  def parse_directive(opcode, line)
    if opcode == '!str'
      line.match(/`(.*?)`/).to_s.gsub('`', '') + "\0"
    elsif opcode == '!chr'
      line.match(/`(.*?)`/).to_s.gsub('`', '')
    elsif opcode == '!res'
      count = line.match(/(\d|[a-f]){2}/).to_s.to_i(16)
      operand = ''
      count.times do
        operand << "\0"
      end
      operand
    else
      nil
    end
  end

  def parse_lines
    @source_lines.each do |line|
      parts = line.split(' ')

      case line[0]
      # comments, memory assignments, raw assembly
      when *%w[; > .]
        @object_lines << "#{line}\n"
      # memory assignment
      when '*'
        address = parts[2].gsub('$', '').to_i(16)
        @object_lines << {}.tap do |line|
          line[:set_address] = address
        end
      # assembler instruction without label
      when ' '
        opcode = parts[0]
        if opcode.start_with?('!')
          operand = parse_directive(opcode, line)
        else
          operand = (parts[1].nil? || parts[1][0] == ';') ? nil : parts[1]
        end

        @object_lines << {}.tap do |line|
          line[:opcode]  = opcode.strip
          line[:operand] = operand
        end
      # assembler instruction with address label
      when /\p{Alpha}/
        opcode = parts[1]
        if opcode.start_with?('!')
          operand = parse_directive(opcode, line)
        else
          operand = (parts[2].nil? || parts[2][0] == ';') ? nil : parts[2]
        end

        @object_lines << {}.tap do |line|
          line[:label]   = parts[0]
          line[:opcode]  = opcode.strip
          line[:operand] = operand
        end
      else
        @object_lines << "\n"
      end
    end

    @object_lines
  end
end
