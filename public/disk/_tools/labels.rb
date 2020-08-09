#------------------------------------------------------------------------------
# 650Vue Assembler - Labels
#
# The Labels object substitutes labels for their target addresses, and applies
# modifiers (<, >, or +) to labels and adjusts their values accordingly.
#
# Copyright © 2020 Dr. Myles L. Skinner - All Rights Reserved.
#------------------------------------------------------------------------------

require './_tools/modifiers.rb'

class Labels
  def initialize(labels, lines)
    @labels = labels.sort_by { |k, _| k.length }.reverse
    @lines = lines
  end

  def resolve_labels
    @lines.map! { |line| resolve_one(line) }

    @lines
  end

  def resolve_one(line)
    @labels.each { |k, v| line.gsub!(k, "$#{v.to_s(16)}") }
    parts = line.split(' ')
    if parts[3].nil?
      line
    else
      if parts[3].match(/#<\$(\d|[a-f]){4}$/)
        parts[3] = "#$#{parts[3][5..6]}"
      elsif parts[3].match(/#>\$(\d|[a-f]){4}$/)
        parts[3] = "#$#{parts[3][3..4]}"
      end
      parts[3] = Modifiers::to_hex(parts[3])

      "#{parts.join(' ')}\n"
    end
  end
end
