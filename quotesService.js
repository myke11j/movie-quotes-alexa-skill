/**
 * @file quotesService.js
 * @author Mukul <@mukul1904>
 * @desc Service for movie-quotes Alexa skill
 */


/* eslint-disable strict, no-return-assign, consistent-return, no-unused-vars */

'use strict';

const unirest = require('unirest');

const messages = require('./messages');
const alexaLogger = require('./logger');

const skillName = 'Movie Quotes';
const API = 'https://andruxnet-random-famous-quotes.p.mashape.com/?cat=movies';

/**
 * @constructor
 *
 * @param {Object} book
 * @param {Object} author
 * @param {Object} intent
 * @param {Object} session
 */
function QuotesService(params) {
  const {
        intent, session, requestId, reqType, appId, sessionId, intentName
    } = params;
  this.name = skillName;
  this.intent = intent || {};
  this.session = session || {};
  this.requestId = requestId;
  this.reqType = reqType;
  this.appId = appId;
  this.sessionId = sessionId;
  this.intentName = intentName || '';
}

QuotesService.prototype.logRequest = function () {
  alexaLogger.logInfo(`ApplicationId=${this.appId}. RequestID=${this.reqType}. ReqType=${this.reqType}. Intent=${this.intentName}. SessionsId=${this.sessionId}`);
};

QuotesService.prototype.handleIntent = function () {
  return new Promise((resolve) => {
    switch (this.reqType) {
      case 'LaunchRequest':
        this.handleLaunchRequest((resp) => {
          const {
                        sessionAttributes, speechletResponse
                    } = resp;
          return resolve({ sessionAttributes, speechletResponse });
        });
        break;
      case 'IntentRequest':
        this.handleIntentRequest((resp) => {
          const {
                        sessionAttributes, speechletResponse
                    } = resp;
          return resolve({ sessionAttributes, speechletResponse });
        });
        break;
      case 'SessionEndedRequest':
        this.handleExitRequest((resp) => {
          const {
                        sessionAttributes, speechletResponse
                    } = resp;
          return resolve({ sessionAttributes, speechletResponse });
        });
        break;
      default:
        break;
    }
  });
};

/**
 * @desc Greeting handler
 */
QuotesService.prototype.handleLaunchRequest = function (done) {
    // If we wanted to initialize the session to have some attributes we could add those here.
  const sessionAttributes = {};
    // const cardTitle = messages.cardGreeting();
    // const speechOutput = messages.messageGreeting();
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
  const repromptText = messages.messageReprompt();
  const shouldEndSession = false;
  const outputSpeech = this.generateOutputSpeech(messages.messageGreeting());
  const card = this.generateCard(messages.cardGreeting(), messages.messageGreeting());
  done({
    sessionAttributes,
    speechletResponse: { card, outputSpeech, repromptText, shouldEndSession }
  });
};

/**
 * @desc Exit and StopIntent handler
 */
QuotesService.prototype.handleExitRequest = function (done) {
  const shouldEndSession = true;
  const card = this.generateCard(messages.cardGoodBye(), messages.messageGoodBye());
  const outputSpeech = this.generateOutputSpeech(messages.messageGoodBye());
  this.session = {};
  done({
    sessionAttributes: {},
    speechletResponse: { card, outputSpeech, repromptText: null, shouldEndSession }
  });
};

/**
 * @desc CancelIntent handler
 */
QuotesService.prototype.handleCancelRequest = function (done) {
  const shouldEndSession = true;
  const card = this.generateCard(messages.cardGoodBye(), messages.messageGoodBye());
  const outputSpeech = this.generateOutputSpeech(messages.messageGoodBye());
  this.session = {};
  done({
    sessionAttributes: {},
    speechletResponse: { card, outputSpeech, repromptText: null, shouldEndSession }
  });
};

/**
 * @desc HelpIntent handler
 */
QuotesService.prototype.handleHelpRequest = function (done) {
  const shouldEndSession = false;
  const repromptText = messages.messageReprompt();
  const card = this.generateCard(messages.cardHelp(), messages.messageHelp());
  const outputSpeech = this.generateOutputSpeech(messages.messageHelp());
  done(this.session,
        { card, outputSpeech, repromptText, shouldEndSession });
};

QuotesService.prototype.handleIntentRequest = function (done) {
  switch (this.intentName) {
    case 'AMAZON.CancelIntent':
      this.handleCancelRequest((resp) => {
        done(resp);
      });
      break;
    case 'AMAZON.StopIntent':
      this.handleExitRequest((resp) => {
        done(resp);
      });
      break;
    case 'AMAZON.HelpIntent':
      this.handleHelpRequest((sessionAttributes, speechletResponse) => done({ sessionAttributes, speechletResponse }));
      break;
    case 'RandomQuote':
      this.handleRandomQuoteIntent((sessionAttributes, speechletResponse) => done({ sessionAttributes, speechletResponse }));
      break;
    default:
      break;
  }
};

QuotesService.prototype.generateCard = function (cardTitle, cardText) {
  return {
    type: 'Standard',
    title: cardTitle,
    text: cardText,
    content: cardText
  };
};

/* OutputSpeech related methods */
QuotesService.prototype.generateOutputSpeech = function (output) {
  return {
    type: 'PlainText',
    text: output
  };
};

QuotesService.prototype.handleRandomQuoteIntent = function (done) {
  const self = this;
  const repromptText = messages.messageReprompt();
  const shouldEndSession = true;
  unirest.post(API)
    .header('X-Mashape-Key', 'PPDOjlQpKGmshRKqdfFr5sdk35W9p1svUSLjsnMpue0lZ2C0jn')
    .header('Content-Type', 'application/x-www-form-urlencoded')
    .header('Accept', 'application/json')
    .end(function (result) {
      if (!result.body) {
        const card = self.generateCard(messages.cardInvalidRequest, messages.messageInvalidRequest);
        const outputSpeech = self.generateOutputSpeech(messages.messageInvalidRequest);
        return done({},
              { card, outputSpeech, repromptText: null, shouldEndSession });
      }
      const resp = JSON.parse(result.body);
      const card = self.generateCard('Random Movie Quote', `From ${resp.author}, ${resp.quote}`);
      const outputSpeech = self.generateOutputSpeech(`From ${resp.author}, ${resp.quote}`);
      return done({},
            { card, outputSpeech, repromptText: null, shouldEndSession });
    });
};

module.exports = QuotesService;
