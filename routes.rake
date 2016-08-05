#require 'action_dispatch/journey/gtg/transition_table'

module ActionDispatch
  module Journey # :nodoc:
    module GTG # :nodoc:
      class TransitionTable # :nodoc:
        def visualizer(paths, title = 'FSM')
          viz_dir   = File.join File.dirname(__FILE__), '..', 'visualizer'
          states    = "function tt() { return #{to_json}; }"

          fun_routes = paths.sample(3).map do |ast|
            ast.map { |n|
              case n
              when Nodes::Symbol
                case n.left
                when ':id' then rand(100).to_s
                when ':format' then %w{ xml json }.sample
                else
                  'omg'
                end
              when Nodes::Terminal then n.symbol
              else
                nil
              end
            }.compact.join
          end
          puts to_dot
        end
      end
    end
  end
end


namespace :viz do
desc "Writes doc/routes.html. Requires Graphviz (dot)"
  task :visualizer => :environment do
    #include ActionDispatch::Journey::GTG
    #v = TransitionTable.new
    #v.visualizer ["/user"]
    Rails.application.routes.router.visualizer
  end
end
