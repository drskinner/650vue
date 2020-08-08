#------------------------------------------------------------------------------
# 650Vue Assembler - Linker
#
# The linker allows the base .src file to include additional .src files through
# the #INCLUDE directive. Does not currently support nested includes.
#
# Copyright © 2020 Dr. Myles L. Skinner - All Rights Reserved.
#------------------------------------------------------------------------------

class Linker
  def initialize(lines)
    @source_lines = lines
    @object_lines = []
  end

  def insert_file(line)
    parts = line.split(' ')
    filename = parts[1]

    filename << '.src' unless filename.end_with?('.src')
    begin
      File.open("./#{filename}", 'r') do |file|
        file.each do |l|
          @object_lines << l.rstrip
        end
      end
    rescue Errno::ENOENT => e
      $stderr.puts "Error in #INCLUDE: #{e}"
      exit 1
    end
  end

  def link_files
    @source_lines.each do |line|
      if line.start_with?('#INCLUDE')
        insert_file(line)
      else
        @object_lines << line
      end
    end

    @object_lines
  end
end