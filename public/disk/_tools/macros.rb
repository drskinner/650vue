#------------------------------------------------------------------------------
# 650Vue Assembler - Macros
#
# The Macros object scans the source code and performs substitutions for any
# @Macros it finds. Macros must resolve to a Ruby method in this file; 650Vue
# does not support dynamically-defined macros at this time.
#
# Copyright © 2020 Dr. Myles L. Skinner - All Rights Reserved.
#------------------------------------------------------------------------------

class Macros
  def initialize(lines)
    @source_lines = lines
    @object_lines = []
  end

  def resolve_macros
    @source_lines.each do |line|
      if line.include?('@')
        parts = line.split(' ')
        if parts[0].start_with?('@')
          resolve_one(label: nil, macro: parts[0], args: parts[1])
        elsif parts[1].start_with?('@')
          resolve_one(label: parts[0], macro: parts[1], args: parts[2])
        else
          @object_lines << line
        end
      else
        @object_lines << line
      end
    end

    @object_lines
  end

  private

  def resolve_one(label: nil, macro:, args:)
    my_method = snake_case(macro[1..-1]).downcase
    if respond_to?(my_method, true)
      send(my_method, label, args)
    else
      @object_lines << "#{label} #{macro} #{args}"
    end
  end

  def snake_case(string)
    string.gsub(/::/, '/')
          .gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2')
          .gsub(/([a-z\d])([A-Z])/,'\1_\2')
          .tr("-", "_")
          .downcase
  end

  #
  # Disable interrupts and set interrupt vector
  # Usage: @SetIRQ $<address>
  #
  # On exit: AC == ??; XR, YR unchanged
  #
  def set_irq(label, args)
    @object_lines << "#{label} sei"
    @object_lines << "  lda #$#{args[3..4]}"
    @object_lines << "  sta $fffe"
    @object_lines << "  lda #$#{args[1..2]}"
    @object_lines << "  sta $ffff"
    @object_lines << "  cli"
  end

  #
  # Set 6502 reset vector
  # Usage: @SetReset $<address>
  #
  # On exit: AC, XR, YR unchanged
  #
  def set_reset(label, args)
    @object_lines << "> fffc #{args[3..4]} #{args[1..2]} ; RESET vector"
  end

  #
  # Set :string_ptr to the start of stringLabel
  # Usage: @setString stringLabel
  # assumes you have defined :string_ptr already.
  #
  # On exit: AC == ??; XR, YR unchanged
  #
  def set_string(label, string)
    @object_lines << "#{label}  lda #<#{string}"
    @object_lines << "  sta :string_ptr"
    @object_lines << "  lda #>#{string}"
    @object_lines << "  sta :string_ptr+1"
  end

  #
  # Write a 16-bit word at destination memory (little-endian)
  # Usage: @writeWord <word>,<destination>
  #
  # On exit: AC == ??; XR, YR unchanged
  #
  def write_word(label, args)
    parts = args.split(',')
    if parts.size != 2
      puts "Bad args in write_word: #{args}"
      return
    end 

    @object_lines << "#{label}  lda #<#{parts[0]}"
    @object_lines << "  sta #{parts[1]}"
    @object_lines << "  lda #>#{parts[0]}"
    @object_lines << "  sta #{parts[1]}+1"
  end
end
