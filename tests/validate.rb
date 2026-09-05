require "yaml"
root = File.expand_path("..", __dir__)
dir = File.join(root, "skills", "dynamic-skills")
text = File.read(File.join(dir, "SKILL.md"))
frontmatter = text.match(/\A---\n(.*?)\n---\n/m) or abort "Missing YAML frontmatter"
data = YAML.safe_load(frontmatter[1])
abort "Invalid skill name" unless data["name"] == File.basename(dir) && data["name"].match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && data["name"].length <= 64
abort "Invalid description" unless data["description"].is_a?(String) && data["description"].length.between?(1, 1024)
abort "Invalid compatibility" unless data["compatibility"].is_a?(String) && data["compatibility"].length <= 500
abort "Invalid metadata" unless data["metadata"].is_a?(Hash) && data["metadata"].all? { |k, v| k.is_a?(String) && v.is_a?(String) }
abort "Missing license" unless data["license"] == "MIT" && File.exist?(File.join(root, "LICENSE"))
ui = YAML.safe_load(File.read(File.join(dir, "agents", "openai.yaml")))["interface"]
abort "Invalid UI description" unless ui["short_description"].length.between?(25, 64)
abort "Missing skill invocation" unless ui["default_prompt"].include?("$" + data["name"])
puts "Skill frontmatter and Codex UI metadata are valid."
