#------------------------------------------------------------------------------
# 650Vue Assembler - Symbols
#
# The Symbols object scans the source code, builds a table of symbol definitions,
# and performs substitutions for any :symbols it finds. This object recognizes
# modifiers (<, >, or +) to symbols and adjusts their values accordingly.
#
# Copyright © 2020 Dr. Myles L. Skinner - All Rights Reserved.
#------------------------------------------------------------------------------

require './_tools/modifiers.rb'

class Symbols
  def initialize(lines)
    @source_lines = lines
    @object_lines = []
    @symbols = {}

    build_symbol_table
  end

  def build_symbol_table
    @source_lines.each do |line|
      if line[0] == ':'
        parts = line.split(' ')
        @symbols[parts[0]] = parts[2]
      end
    end

    @symbols = @symbols.sort_by {|k, _| k.length }.reverse.to_h
  end

  def resolve_symbols
    @source_lines.each do |line|
      parts = line.split(' ')

      # directive, like !str
      if line.match(/\![A-Za-z]{3,}/)
        @object_lines << line
      # regular instruction
      elsif line.start_with?(' ')
        operand = resolve_one(operand: parts[1])
        @object_lines << "  #{parts[0]} #{operand}"
      # instruction with label
      elsif line.length > 0 && line[0].match(/\p{Alpha}/)
        operand = resolve_one(operand: parts[2])
        @object_lines << "#{parts[0]}  #{parts[1]} #{operand}"
      # don't keep symbol defs
      elsif line.start_with?(':')
        next
      # everything else, leave untouched
      else
        @object_lines << line
      end
    end

    @object_lines
  end

  def resolve_one(operand: nil)
    return operand if operand.nil? || operand[0] == ';'
    
    @symbols.each { |k, v| operand.gsub!(k, v) }
    operand = Modifiers::to_hex(operand)
  end
end
