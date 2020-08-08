#------------------------------------------------------------------------------
# 650Vue Assembler - Modifiers
#
# The Modifiers object modifies operands in two ways:
#   (1) converting binary and decimal numbers into hex, and
#   (2) adjusting values with the +, <, and > modifiers.
#
# Copyright © 2020 Dr. Myles L. Skinner - All Rights Reserved.
#------------------------------------------------------------------------------

class Modifiers
  def self.to_hex(operand)
    # binary
    if operand.match(/%[01]{4}_[01]{4}/)
      operand = "#$#{'%02x' % operand.delete('^01').to_i(2)}"
    end

    # decimal
    if operand.match(/#[0-9]+/)
      operand = "#$#{'%02x' % operand.delete('^0-9').to_i}"
    end

    # offsets
    i = operand.index('+')
    if i && operand.start_with?('$')
      base = operand[1..i-1]
      offset = operand[i+1..-1]

      if base.length == 2
        operand = "$#{'%02x' % (base.to_i(16) + offset.to_i(16))}"
      end
      if base.length == 4
        operand = "$#{'%04x' % (base.to_i(16) + offset.to_i(16))}"
      end
    end

    # Low byte of address
    if operand.start_with?('#<$')
      operand = "#$#{operand[5..6]}"
    end

    # High byte of address
    if operand.start_with?('#>$')
      operand = "#$#{operand[3..4]}"
    end

    operand
  end
end
