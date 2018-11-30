const config = require('../config')

function getAgentName(skillName) {
    return config.agents[skillName]
}

module.exports.getAgentName = getAgentName
