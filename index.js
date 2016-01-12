var util = require('./util.js'),
    _ = require('lodash'),
    pickInputs = {
        'id': { key: 'id', validate: { req: true }},
        'comment': { key: 'comment', validate: { req: true }}
    }, pickOutputs = {
        id: 'id',
        requester_id: 'requester_id',
        assignee_id: 'assignee_id',
        collaborator_ids: 'collaborator_ids',
        created_at: 'created_at',
        subject: 'subject',
        description: 'description',
        status: 'status'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.provider('zendesk').credentials('access_token'),
            username = dexter.provider('zendesk').data('username'),
            subdomain = dexter.provider('zendesk').data('subdomain');

        if (!token || !username || !subdomain)
            return this.fail('A [access_token, username, subdomain] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        var request = require('request').defaults({
            baseUrl: 'https://' + subdomain + '.zendesk.com/api/v2/'
        });

        request.put({
            uri: '/requests/' + inputs.id + '.json',
            body: {
                request: { comment: { body: inputs.comment } }
            },
            auth: {
                user: username.concat('/token'),
                pass: token
            },
            json: true
        }, function (err, response, result) {
            console.log(result);
            if (err || (result && result.error))
                this.fail(err || result);
            else
                this.complete(util.pickOutputs(result.request, pickOutputs));
        }.bind(this));
    }
};
