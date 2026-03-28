const fs = require("fs")
module.exports.readVersion = function (contents) {
  const match = contents.match(/__version__\s*=\s*"([^"]+)"/)
  return match ? match[1] : "0.0.0"
}
module.exports.writeVersion = function (contents, version) {
  return contents.replace(/__version__\s*=\s*"[^"]+"/, `__version__ = "${version}"`)
}
