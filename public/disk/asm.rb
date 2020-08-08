#------------------------------------------------------------------------------
# 650Vue Assembler - Main
#
# Usage: ruby asm.rb <filename>
#
# The 650Vue Assembler takes in a .src file and outputs a .obj file that can
# be loaded and run in the 650Vue web application. The assembler builds the
# object file in several passes:
#   (1) inserting external library files into the parent source file,
#   (2) substituting pre-defined macros,
#   (3) building a symbol table and replacing symbols with values,
#   (4) parsing the source to prepare it for memory allocation,
#   (5) determining the correct memory location for each instruction,
#   (6) resolving all labels to their 16-bit addresses, and
#   (7) writing the object file.
#
# The object file can be loaded into 650Vue and will be handled as if the
# user had typed each line into the terminal.
#------------------------------------------------------------------------------

require './_tools/allocations.rb'
require './_tools/labels.rb'
require './_tools/linker.rb'
require './_tools/macros.rb'
require './_tools/parser.rb'
require './_tools/symbols.rb'

class Assembler
  def initialize
    @source_lines = []
    @parsed_lines = []
    @object_lines = []
    @symbols = {}
    @labels = {}
    @address = 0

    if !ARGV[0]
      puts 'Usage: ruby asm.rb <filename>'
      exit 1
    else
      @filename = +ARGV[0]
      @filename << '.src' unless @filename.end_with?('.src')
      begin
        File.open("./#{@filename}", 'r') do |file|
          file.each do |line|
            @source_lines << line.rstrip
          end
        end
      rescue Errno::ENOENT => e
        $stderr.puts "ERROR: #{e}"
        exit 1
      end
    end
  end

  def compile
    # TODO: modify for recursive includes
    link = Linker.new(@source_lines)
    @source_lines = link.link_files

    m = Macros.new(@source_lines)
    @source_lines = m.resolve_macros

    s = Symbols.new(@source_lines)
    @source_lines = s.resolve_symbols

    p = Parser.new(@source_lines)
    @parsed_lines = p.parse_lines

    a = Allocations.new(@parsed_lines)
    @object_lines = a.allocate_memory
    @labels = a.get_labels

    l = Labels.new(@labels, @object_lines)
    @object_lines = l.resolve_labels

    write_object_code
  end

  def write_object_code
    File.open("./#{@filename.gsub('.src', '.obj')}", 'w') do |file|
      @object_lines.each do |line|
        file.write line
      end
    end
  end
end

asm = Assembler.new
asm.compile
