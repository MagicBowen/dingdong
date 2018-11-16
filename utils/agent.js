function getAgentName(skillName) {
    const AGENT_MAP = {
        'my_course' : 'course-record',
        'lucky_number' : 'indentifyCode',
        'dictation' : 'dictation'
    }
    return AGENT_MAP[skillName]
}

module.exports.getAgentName = getAgentName
