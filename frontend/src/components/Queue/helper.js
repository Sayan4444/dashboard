export const getFormattedYaml = (yaml) => {
    return yaml.split("\n")
        .map((line) => {
            const keyMatch = line.match(/^(\s*)([^:\s]+):/);
            if (keyMatch) {
                const [, indent, key] = keyMatch;
                const value = line.slice(keyMatch[0].length);
                return `${indent}<span class="yaml-key">${key}</span>:${value}`;
            }
            return line;
        })
        .join("\n");
}