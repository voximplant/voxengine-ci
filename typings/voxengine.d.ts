
/**
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.ACD);
 * ```
 */
declare interface ACDEnqueueParams {
  /**
   * Priority (1-100, 1 is the highest priority).
   * If two or more objects have the same priorities, they are handled according to the order of HTTP requests from JS scenario to the ACD queue.
   */
  priority: number;
  /**
   * Optional extra headers to be passed with the call to the agent.
   * Custom header names have to begin with the 'X-' prefix except the 'VI-CallTimeout': '60' which switches to another agent if current one does not answer after the timeout (in seconds, minimum value: 10, maximum value: 400, default value: 60).
   * The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  headers: { [header: string]: string };
  /**
   * Whether the call has video support. Please note that prices for audio only and video calls are different.
   */
  video: boolean;
  /**
   * Custom data for the current call object.
   */
  customData: string;
}

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.ACD);
 * ```
 * @event
 */
declare enum ACDEvents {
  /**
   * Triggers when an agent is reached.
   * @typedef _ACDReachedEvent
   */
  OperatorReached = 'ACD.OperatorReached',
  /**
   * Triggers when an ACD makes a call to a user via the [callUser] method.
   * @typedef _ACDCallAttempt
   */
  OperatorCallAttempt = 'ACD.OperatorCallAttempt',
  /**
   * Triggers when an ACD request tries to reach an agent, but the agent declines the call. IMPORTANT NOTE: This is just a notification, the request processing does not stop. The ACD request automatically redirects to the next free agent.
   * @typedef _ACDFailedEvent
   */
  OperatorFailed = 'ACD.OperatorFailed',
  /**
   * Triggers if the ACD service returns an internal error. The JS scenarios are not able to cause internal errors because these errors depend on internal and network issues.
   * @typedef _ACDErrorEvent
   */
  Error = 'ACD.Error',
  /**
   * Triggers as a result of the [ACDRequest.getStatus] method call.
   * @typedef _ACDWaitingEvent
   */
  Waiting = 'ACD.Waiting',
  /**
   * Triggers when an [ACDRequest] is put to the queue.
   * @typedef _ACDQueuedEvent
   */
  Queued = 'ACD.Queued',
  /**
   * Triggers if all agents that can handle a request in the specified queue are offline. In this case, the request is not queued.
   * @typedef _ACDOfflineEvent
   */
  Offline = 'ACD.Offline',
  /**
   * Triggers when we have one more request to put in the queue but the maximum number of requests (max_queue_size) is already reached. In this case, the new request is not queued. The max_queue_size and max_waiting_time default values are “unlimited”, you can change these values for every new or existing queue in the [control panel](https://manage.voximplant.com/applications).
   * @typedef _ACDQueueFullEvent
   */
  QueueFull = 'ACD.QueueFull',
}

/**
 * @private
 */
declare interface _ACDEvents {
  [ACDEvents.OperatorReached]: _ACDReachedEvent;
  [ACDEvents.OperatorCallAttempt]: _ACDCallAttempt;
  [ACDEvents.OperatorFailed]: _ACDFailedEvent;
  [ACDEvents.Error]: _ACDErrorEvent;
  [ACDEvents.Waiting]: _ACDWaitingEvent;
  [ACDEvents.Queued]: _ACDQueuedEvent;
  [ACDEvents.Offline]: _ACDOfflineEvent;
  [ACDEvents.QueueFull]: _ACDQueueFullEvent;
}

/**
 * @private
 */
declare interface _ACDBaseEvent {
  /**
   * Request that generated the event
   */
  request: ACDRequest;
}

/**
 * @private
 */
declare interface _ACDReachedEvent extends _ACDBaseEvent {
  /**
   * Established call with agent
   */
  operatorCall: Call;
}

/**
 * @private
 */
declare interface _ACDCallAttempt extends _ACDBaseEvent {
  /**
   * Agent's call
   */
  operatorCall: Call;
}

/**
 * @private
 */
declare interface _ACDFailedEvent extends _ACDBaseEvent {
  /**
   * Username of failed agent
   */
  operatorUserName: string;
  /**
   * Call status code
   */
  statusCode: number;
}

/**
 * @private
 */
declare interface _ACDErrorEvent extends _ACDBaseEvent {
  /**
   * Error message
   */
  error: string;
}

/**
 * @private
 */
declare interface _ACDWaitingEvent extends _ACDBaseEvent {
  /**
   * Estimated waiting time in minutes (value of 0 is also possible)
   */
  ewt: number;

  /**
   * Position of the request in the queue
   */
  position: number;
}

/**
 * @private
 */
declare interface _ACDQueuedEvent extends _ACDBaseEvent {}

/**
 * @private
 */
declare interface _ACDOfflineEvent extends _ACDBaseEvent {}

/**
 * @private
 */
declare interface _ACDQueueFullEvent extends _ACDBaseEvent {}

/**
 * Represents request that is put to the ACD queue.
 *
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.ACD);
 * ```
 */
declare class ACDRequest {
  /**
   * Returns request id. It can be used as the <b>acd\_request\_id</b> parameter in the [GetACDHistory](/docs/references/httpapi/managing_history#getacdhistory) method to search in ACD history.
   */
  public id(): string;

  /**
   * Gets status of the current request. Not to be called before the request is successfully queued (the [ACDEvents.Queued] event). This method's call triggers the [ACDEvents.Waiting] event; it is possible to retrieve an estimated waiting time in minutes via the <b>ewt</b> property of the event.
   */
  public getStatus(): void;

  /**
   * Adds a handler for the specified [ACDEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [ACDEvents.Offline])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  public addEventListener<T extends keyof _ACDEvents>(
    event: ACDEvents | T,
    callback: (ev: _ACDEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [ACDEvents] event
   * @param event Event class (i.e., [ACDEvents.Offline])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  public removeEventListener<T extends keyof _ACDEvents>(
    event: ACDEvents | T,
    callback?: (ev: _ACDEvents[T]) => any
  ): void;

  /**
   * Cancel pending request and remove it from the queue
   */
  public cancel(): void;
}

/**
 * The AI module provides additional methods that use Artificial Intelligence. These methods allow solving business tasks in a more productive way.
 * Add the following line to your scenario code to use the module:
 * ```
 * require(Modules.AI);
 * ```
 */
declare namespace AI {}

declare namespace AI {
  /**
   * Creates and returns a new Dialogflow instance which provides resources for exchanging data with the Dialogflow API, handling events etc.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.AI);
   * ```
   * @param params
   */
  function createDialogflow(params: DialogflowSettings): DialogflowInstance;
}

declare namespace AI {
  /**
   * Represents the parameters of the voicemail recognition session.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   * @deprecated Use [AMD] module instead
   **/
  interface DetectVoicemailParameters {
    /**
     * Recognition model. The possible values are 'ru', 'colombia'. The default value is 'ru'.
     */
    model: string;
    /**
     * Detection threshold in the 0.0 - 1.0 (ms) range. Durations shorter than this value are considered human speech, and durations longer than this value are considered voicemail. The default value is 0.8. Available only with the latam model.
     */
    threshold?: number;
  }
}

declare namespace AI {
  /**
   * Start a voicemail recognition session. You can check how many times voicemail was detected in the call history.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.AI);
   * ```
   * @param call
   * @param detectVoicemailParameters
   * @deprecated Use [AMD] module instead
   */
  function detectVoicemail(
      call: Call,
      detectVoicemailParameters: DetectVoicemailParameters
  ): Promise<AI.Events>;
}

declare namespace AI {
  /**
   * Dialogflow events allow matching intents by event name instead of the natural language input.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowEventInput {
    /**
     * The unique identifier of the event.
     */
    name: string;
    /**
     * The collection of parameters associated with the event
     */
    parameters: { [key: string]: any };
    /**
     * The language ot this conversation query
     */
    languageCode: DialogflowLanguage;
  }
}

declare namespace AI {
  /**
   * This class represents the Dialogflow instance.
   * Add the following line to your scenario code to use the class:
   * ```
   * require(Modules.AI);
   * ```
   */
  class DialogflowInstance {
    /**
     * @param id
     * @param params
     */
    constructor(id: string, params: any);

    /**
     * Set parameters for the intents.
     * @param queryParameters
     */
    public setQueryParameters(queryParameters: DialogflowQueryParameters): void;

    /**
     * Set a collection of phrase hints for the intents.
     * @param phraseHints The collection of phrase hints to boost the speech recognition accuracy.
     */
    public setPhraseHints(phraseHints: { [id: string]: string }): void;

    /**
     * Update the audio output configuration.
     * @param outputAudioConfig
     */
    public setOutputAudioConfig(outputAudioConfig: DialogflowOutputAudioConfig): void;

    /**
     * Stop and destroy the current Dialogflow instance.
     */
    public stop(): void;

    /**
     * Send a query to the DialogFlow instance. You can send either a text string up to 256 characters or an event object with the event name and additional data.
     * @param dialogflowQuery Text string (up to 256 characters) or an event object.
     */
    public sendQuery(dialogflowQuery: DialogflowQueryInput): void;

    /**
     * Add a Dialogflow speech synthesis playback marker. The [AI.Events.DialogflowPlaybackMarkerReached](/docs/references/voxengine/ai/events#dialogflowplaybackmarkerreached) event is triggered when the marker is reached.
     * @param offset Positive/negative offset (ms) from the start/end of media.
     */
    public addMarker(offset: number): void;

    /**
     * Start sending voice from a Dialogflow participant to the media unit specified in targetCall.
     */
    public sendMediaTo(targetMediaUnit: VoxMediaUnit, optional?: SendMediaOptions): void;

    /**
     * Stop sending voice from a Dialogflow participant to the media unit specified in targetCall.​
     */
    public stopMediaTo(targetMediaUnit: VoxMediaUnit): void;

    /**
     * Adds a handler for the specified [AI.Events]. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
     * @param event Event class (i.e., AI.Events.DialogflowResponse)
     * @param callback Handler function. A single parameter is passed: object with event information
     */
    public addEventListener<T extends keyof AI._Events>(
      event: AI.Events | T,
      callback: (ev: AI._Events[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [AI.Events] event
     * @param event Event class (i.e., AI.Events.DialogflowResponse)
     * @param callback Handler function. If not specified, all event listeners are removed
     */
    public removeEventListener<T extends keyof AI._Events>(
      event: AI.Events | T,
      callback?: (ev: AI._Events[T]) => any
    ): void;
  }
}

declare namespace AI {
  /**
   * Instructs the speech synthesizer on how to generate the output audio content.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowOutputAudioConfig {
    /**
     * Optional. Configuration of how speech should be synthesized.
     */
    synthesizeSpeechConfig?: DialogflowSynthesizeSpeechConfig;
  }
}

declare namespace AI {
  /**
   * Represents the Dialogflow query input. It can contain either:
   * 1. A conversational query in the form of text
   * 2. An event that specifies which intent to trigger
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowQueryInput {
    /**
     * The natural language text to be processed.
     */
    text: DialogflowTextInput;
    /**
     * The event to be processed.
     */
    event: DialogflowEventInput;
  }
}

declare namespace AI {
  /**
   * Represents the parameters of the conversational query. All the parameters are optional.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   **/
  interface DialogflowQueryParameters {
    /**
     * The time zone of the conversational query from the time zone database, e.g., America/New_York, Europe/Paris. If not provided, the system uses the time zone specified in agent settings.
     */
    timeZone: string;
    /**
     * The geolocation of the conversational query.
     */
    geoLocation: { [key: string]: any };
    /**
     * The collection of contexts to be activated before the query execution.
     */
    contexts: any[];
    /**
     * Whether to delete all contexts in the current session before activation of a new one.
     */
    resetContexts: boolean;
    /**
     * The collection of session entity types to replace or extend developer entities with for this query only. The entity synonyms apply to all languages.
     */
    sessionEntityTypes: any[];
    /**
     * Use this field to pass custom data into the webhook associated with the agent. Arbitrary JSON objects are supported.
     */
    payload: { [key: string]: any };
  }
}

declare namespace AI {
  /**
   * Represents Dialogflow intent response.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowResponse {
    /**
     * The unique identifier of the response. Use it to locate a response in the training example set or for reporting issues.
     */
    responseId: string;
    /**
     * Optional. The result of the conversational query or event processing.
     */
    queryResult?: DialogflowResult;
    /**
     * Optional. The result of speech recognition.
     */
    recognitionResult?: DialogflowStreamingRecognitionResult;
    /**
     * Status of the webhook request.
     */
    webhookStatus: { [id: string]: any };
  }
}

declare namespace AI {
  /**
   * Represents the result of an intent response.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   **/
  interface DialogflowResult {
    /**
     * The original conversational query text:  - If natural language text was provided as input, query_text contains a copy of the input.  - If natural language speech audio was provided as input, query_text contains the speech recognition result. If speech recognizer produced multiple alternatives, a particular one is picked.  - If an event was provided as input, query_text is not set.
     */
    queryText: string;
    /**
     * The action name from the matched intent.
     */
    action: string;
    /**
     * The collection of extracted parameters.
     */
    parameters: { [id: string]: any };
    /**
     * Whether all the required parameters are present. This field is set to:  - false if the matched intent has required parameters and not all the required parameter values have been collected.  - true if all required parameter values have been collected, or if the matched intent does not contain any required parameters.
     */
    allRequiredParamsPresent: boolean;
    /**
     * This field is set to:  - false if the matched intent has required parameters and not all the required parameter values have been collected.  - true if all required parameter values have been collected, or if the matched intent does not contain any required parameters.
     * @deprecated
     */
    fulfillmentText: string;
    /**
     * The collection of rich messages to present to the user.
     */
    fulfillmentMessages: any[];
    /**
     * The intent that matched the conversational query. Some, not all fields are filled in this message, including but not limited to: name, display_name and webhook_state.
     */
    intent: { [id: string]: any };
    /**
     * The intent detection confidence. Values range from 0.0 (completely uncertain) to 1.0 (completely certain).
     */
    intentDetectionConfidence: number;
    /**
     * The free-form diagnostic info. For example, this field could contain webhook call latency.
     */
    diagnosticInfo: { [id: string]: any };
    /**
     * The language that was triggered during intent detection. See [Language support](https://cloud.google.com/dialogflow/docs/reference/language) for a list of the currently supported language codes.
     */
    languageCode: string;
  }
}

declare namespace AI {
  /**
   * Settings for setting up a new Dialogflow instance
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   **/
  interface DialogflowSettings {
    /**
     * Language for the Dialogflow instance.
     */
    lang: DialogflowLanguage;
    /**
     * Optional. The collection of phrase hints to boost accuracy of speech recognition.
     */
    phraseHints?: any[];
    /**
     * Initial query parameters.
     */
    queryParameters: DialogflowQueryParameters;
    /**
     * Whether to enable single utterance.
     */
    singleUtterance: boolean;
    /**
     * Instructs the speech synthesizer how to generate the output audio content.
     */
    outputAudioConfig: DialogflowOutputAudioConfig;
    /**
     * Optional. Dialogflow session id. Use it for connection to the existing Dialogflow session or to specify your own id for a new session.
     */
    sessionId?: string;
    /**
     * Optional. ID of the Dialogflow agent certificate to use. It can be any of the certificates previously added in the [control panel](https://manage.voximplant.com/applications), see the Dialogflow Connector section in your Voximplant application. You do not need to specify agentId if you have only one Dialogflow agent certificate in your Voximplant application.
     */
    agentId?: number;
    /**
     * Optional. Part of the Dialogflow [session](https://cloud.google.com/dialogflow/docs/reference/rpc/google.cloud.dialogflow.v2beta1#google.cloud.dialogflow.v2beta1.StreamingDetectIntentRequest) name. If Environment ID is not specified, we assume default ‘draft’ environment.
     */
    environmentId?: string;
    /**
     * Optional. Part of the Dialogflow [session](https://cloud.google.com/dialogflow/docs/reference/rpc/google.cloud.dialogflow.v2beta1#google.cloud.dialogflow.v2beta1.StreamingDetectIntentRequest) name. If User ID is not specified, we use “-”.
     */
    userId?: string;
    /**
     * Whether to use beta. Optional. The Voximplant Dialogflow Connector uses Dialogflow v2 Beta by default. Set false to use the non-Beta version of Dialogflow v2.
     */
    beta?: boolean;
    /**
     * Optional. The agent’s location.
     */
    region?: string;
    /**
     * Optional. Machine learning model to transcribe your audio file.
     */
    model?: DialogflowModel;
    /**
     * Optional. Variant of the specified Speech model to use.
     */
    modelVariant?: DialogflowModelVariant;
  }
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.AI);
 * ```
 */
declare enum DialogflowSsmlVoiceGender {
  /**
   * An unspecified gender, which means that the customer does not care which gender the selected voice has.
   */
  UNSPECIFIED = 'SSML_VOICE_GENDER_UNSPECIFIED',
  /**
   * A male voice.
   */
  MALE = 'SSML_VOICE_GENDER_MALE',
  /**
   * A female voice.
   */
  FEMALE = 'SSML_VOICE_GENDER_FEMALE',
  /**
   * A gender-neutral voice.
   */
  NEUTRAL = 'SSML_VOICE_GENDER_NEUTRAL',
}

declare namespace AI {
  /**
   * Contains a speech recognition result, corresponding to a portion of the audio that is currently being processed; or an indication that this is the end of the single requested utterance.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowStreamingRecognitionResult {
    /**
     * Type of the result message.
     */
    messageType: string;
    /**
     * Optional. Transcript text representing the words that the user spoke.
     */
    transcript: string;
    /**
     * The default of 0.0 is a sentinel value indicating confidence was not set. If false, the StreamingRecognitionResult represents an interim result that may change. If true, the recognizer does not return any further hypotheses about this piece of the audio.
     */
    isFinal: boolean;
    /**
     * The Speech confidence between 0.0 and 1.0 for the current portion of audio. The default of 0.0 is a sentinel value indicating that confidence was not set. This field is typically only provided if is_final is true, and you should not rely on it being accurate or even set.
     */
    confidence: number;
  }
}

declare namespace AI {
  /**
   * Configuration of how speech should be synthesized.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowSynthesizeSpeechConfig {
    /**
     * Optional. Speaking rate/speed, in the range [0.25, 4.0]. 1.0 is the normal native speed supported by the specific voice. 2.0 is twice as fast, and 0.5 is half as fast. If not set (0.0), defaults to the native 1.0 speed. Any other values < 0.25 or > 4.0 return an error.
     */
    speakingRate?: number;
    /**
     * Optional. Speaking pitch, in the range [-20.0, 20.0]. 20 means increase 20 semitones from the original pitch. -20 means decrease 20 semitones from the original pitch.
     */
    pitch?: number;
    /**
     * Optional. Volume gain (in dB) of the normal native volume supported by the specific voice, in the range [-96.0, 16.0]. If not set, or set to a value of 0.0 (dB), plays at normal native signal amplitude. A value of -6.0 (dB) plays at approximately half the amplitude of the normal native signal amplitude. A value of +6.0 (dB) plays at approximately twice the amplitude of the normal native signal amplitude. We strongly recommend not to exceed +10 (dB) as there is usually no effective increase in loudness for any value greater than that.
     */
    volumeGainDb?: number;
    /**
     * Optional. An identifier which selects 'audio effects' profiles that are applied on (post synthesized) text to speech. Effects are applied on top of each other in the order they are given.
     */
    effectsProfileId?: string[];
    /**
     * Optional. The desired voice of the synthesized audio.
     */
    voice?: DialogflowVoiceSelectionParams;
  }
}

declare namespace AI {
  /**
   * Represents the natural language text to be processed.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowTextInput {
    /**
     * The UTF-8 encoded natural language text to be processed. Text length must not exceed 256 bytes
     */
    text: string;
    /**
     * The language ot the conversation query
     */
    languageCode: DialogflowLanguage;
  }
}

declare namespace AI {
  /**
   * Description of which voice to use for speech synthesis.
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowVoiceSelectionParams {
    /**
     * Optional. The name of the voice. If not set, the service chooses a voice based on the other parameters such as language_code and gender.
     */
    name?: string;
    /**
     * Optional. The preferred gender of the voice. If not set, the service chooses a voice based on the other parameters such as language_code and name. Note that this is only a preference, not requirement. If a voice of the appropriate gender is not available, the synthesizer should substitute a voice with a different gender rather than failing the request.
     */
    ssmlGender?: DialogflowSsmlVoiceGender;
  }
}

declare namespace AI {
  /**
   * Add the following line to your scenario code to use the events:
   * ```
   * require(Modules.AI);
   * ```
   * @event
   */
  enum Events {
    /**
     * Triggers when a Dialogflow instance returns a query result.
     * @typedef _DialogflowQueryResultEvent
     */
    DialogflowQueryResult = 'AI.Events.DialogflowQueryResult',
    /**
     * Triggers when a Dialogflow instance returns a recognition result.
     * @typedef _DialogflowRecognitionResultEvent
     */
    DialogflowRecognitionResult = 'AI.Events.DialogflowRecognitionResult',
    /**
     * Triggers when a Dialogflow instance returns an intent response.
     * @typedef _DialogflowResponseEvent
     */
    DialogflowResponse = 'AI.Events.DialogflowResponse',
    /**
     * Triggers when a Dialogflow instance causes error.
     * @typedef _DialogflowErrorEvent
     */
    DialogflowError = 'AI.Events.DialogflowError',
    /**
     * Triggers when a Dialogflow instance is stopped.
     * @typedef _DialogflowStoppedEvent
     */
    DialogflowStopped = 'AI.Events.DialogflowStopped',
    /**
     * Triggers when a playback of a single phrase is finished successfully or in case of playback error.
     * @typedef _DialogflowPlaybackFinishedEvent
     */
    DialogflowPlaybackFinished = 'AI.Events.DialogflowPlaybackFinished',
    /**
     * Triggers when a playback of a single phrase is started.
     * @typedef _DialogflowPlaybackStartedEvent
     */
    DialogflowPlaybackStarted = 'AI.Events.DialogflowPlaybackStarted',
    /**
     * Triggers when 'DialogflowInstance.addMarker' is reached.
     * @typedef _DialogflowPlaybackMarkerReachedEvent
     */
    DialogflowPlaybackMarkerReached = 'AI.Events.DialogflowPlaybackMarkerReached',
    /**
     * Triggers when an answering machine or voicemail is detected.
     * @typedef _VoicemailDetectedEvent
     * @deprecated Use [AMD] module instead
     */
    VoicemailDetected = 'AI.Events.VoicemailDetected',
    /**
     * Triggers when an answering machine or voicemail is not detected.
     * @typedef _VoicemailNotDetectedEvent
     * @deprecated Use [AMD] module instead
     */
    VoicemailNotDetected = 'AI.Events.VoicemailNotDetected',
  }

  /**
   * @private
   */
  interface _Events {
    [Events.DialogflowQueryResult]: _DialogflowQueryResultEvent;
    [Events.DialogflowRecognitionResult]: _DialogflowRecognitionResultEvent;
    [Events.DialogflowResponse]: _DialogflowResponseEvent;
    [Events.DialogflowError]: _DialogflowErrorEvent;
    [Events.DialogflowStopped]: _DialogflowStoppedEvent;
    [Events.DialogflowPlaybackFinished]: _DialogflowPlaybackFinishedEvent;
    [Events.DialogflowPlaybackStarted]: _DialogflowPlaybackStartedEvent;
    [Events.DialogflowPlaybackMarkerReached]: _DialogflowPlaybackMarkerReachedEvent;
    [Events.VoicemailDetected]: _VoicemailDetectedEvent;
    [Events.VoicemailNotDetected]: _VoicemailNotDetectedEvent;
  }

  /**
   * @private
   */
  interface _DialogflowEvent {
    /**
     * Link to the Dialogflow instance
     */
    dialogflow: DialogflowInstance;
  }

  /**
   * @private
   */
  interface _DialogflowQueryResultEvent extends _DialogflowEvent {
    /**
     * The results of the conversational query or event processing
     */
    result: DialogflowResult;
  }

  /**
   * @private
   */
  interface _DialogflowRecognitionResultEvent extends _DialogflowEvent {
    /**
     * The default of 0.0 is a sentinel value indicating confidence was not set. If it is false, the StreamingRecognitionResult represents an interim result that may change. If it is true, the recognizer does not return any further hypotheses about this piece of the audio.
     */
    isFinal: boolean;
  }

  /**
   * @private
   */
  interface _DialogflowResponseEvent extends _DialogflowEvent {
    /**
     * The intent response
     */
    response: DialogflowResponse;
  }

  /**
   * @private
   */
  interface _DialogflowErrorEvent extends _DialogflowEvent {
    /**
     * The cause of the event
     */
    cause: string;
  }

  /**
   * @private
   */
  interface _DialogflowStoppedEvent extends _DialogflowEvent {
    /**
     * The cause of the event
     */
    cause: string;
  }

  /**
   * @private
   */
  interface _DialogflowPlaybackFinishedEvent extends _DialogflowEvent {
    error?: string;
  }

  /**
   * @private
   */
  interface _DialogflowPlaybackStartedEvent extends _DialogflowEvent {
    /**
     * Playback duration
     */
    duration: number;
  }

  /**
   * @private
   */
  interface _DialogflowPlaybackMarkerReachedEvent extends _DialogflowEvent {
    /**
     * Marker offset
     */
    offset: number;
  }

  /**
   * @private
   */
  interface _VoicemailBaseEvent {
    /**
     * Call that triggers the event
     */
    call: Call;
  }

  /**
   * @private
   */
  interface _VoicemailDetectedEvent extends _VoicemailBaseEvent {
    /**
     * Recognition confidence. Values range from 0 (completely uncertain) to 100 (completely certain). The value is not guaranteed to be accurate, consider it while handling the event.
     */
    confidence: number;
  }

  /**
   * @private
   */
  interface _VoicemailNotDetectedEvent extends _VoicemailBaseEvent {}
}

declare namespace AMD {
  /**
   * Parameters for the [AMD.create] method.
   */
  interface AMDParameters {
    /**
     * Recognition model - [AMD.Model]
     */
    model: AMD.Model;
    /**
     * The [Call] instance to detect the voicemail
     */
    call: Call;
    /**
     * Optional. Detection timeout (on call connected only) in milliseconds. The default value is 6500. Must not be less than 0 or greater than 10000.
     */
    timeout?: number;
  }
}

/**
 * The AI module provides additional methods that use Artificial Intelligence. These methods allow solving business tasks in more productive way.
 * Add the following line to your scenario code to use the ref folder:
 * ```
 * require(Modules.AI);
 * ```
 */
declare namespace AMD {}

declare namespace AMD {
  /**
   * Answering machine or voicemail detector class.
   */
  class AnsweringMachineDetector {
    public readonly model: AMD.Model;
    public readonly call: Call;
    public readonly timeout?: number;

    /**
     * Starts answering machine or voicemail recognition session.
     */
    public detect(): Promise<AMD.Events>;

    /**
     * Adds a handler for the specified [AMD.Events]. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called
     * @param event Event class (e.g., AMD.Events.DetectionComplete)
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    public addEventListener<T extends keyof AMD._Events>(
      event: AMD.Events | T,
      callback: (ev: AMD._Events[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [AMD.Events] event
     * @param event Event class (i.e., AMD.Events.DetectionComplete)
     * @param callback Handler function. If not specified, all event listeners are removed
     */
    public removeEventListener<T extends keyof AMD._Events>(
      event: AMD.Events | T,
      callback?: (ev: AMD._Events[T]) => any
    ): void;
  }
}

declare namespace AMD {
  /**
   * Creates answering machine or voicemail detector.
   */
  function create(params: AMD.AMDParameters): AMD.AnsweringMachineDetector;
}

declare namespace AMD {
  /**
   * Add the following line to your scenario code to use the events:
   * ```
   * require(Modules.AI);
   * ```
   * @event
   */
  enum Events {
    /**
     * Triggers when answering machine or voicemail detection is complete.
     * @typedef AMD._DetectionCompleteEvent
     */
    DetectionComplete = 'AMD.Events.DetectionComplete',
    /**
     * Triggers when answering machine detector throw an error.
     * @typedef AMD._DetectionErrorEvent
     */
    DetectionError = 'AMD.Events.DetectionError',
  }

  /**
   * @private
   */
  interface _Events {
    [AMD.Events.DetectionComplete]: AMD._DetectionCompleteEvent;
    [AMD.Events.DetectionError]: AMD._DetectionErrorEvent;
  }

  /**
   * @private
   */
  interface _DetectionCompleteEvent {
    /**
     * Call that triggers the event.
     */
    call: Call;
    /**
     * Answering machine result class, such as human, voicemail, timeout or call termination.
     */
    resultClass: AMD.ResultClass;
    /**
     * Recognition confidence. Values range from 0 (completely uncertain) to 100 (completely certain). The value is not guaranteed to be accurate, consider it while handling the event.
     */
    confidence?: number;
  }

  /**
   * @private
   */
  interface _DetectionErrorEvent {
    /**
     * Error message
     */
    message: string;
  }
}

declare namespace AMD {
  /**
   * Answering machine or voicemail detector model.
   */
  enum Model {
    BR = 'br',
    COLOMBIA = 'colombia',
    KZ = 'kz',
    MX = 'mx',
    RU = 'ru',
  }
}

declare namespace AMD {
  /**
   * Answering machine result class, such as human, voicemail, timeout or call termination.
   */
  enum ResultClass {
    VOICEMAIL = 'VOICEMAIL',
    HUMAN = 'HUMAN',
    TIMEOUT = 'TIMEOUT',
    CALL_ENDED = 'CALL_ENDED',
  }
}

/**
 * @event
 */
declare enum AppEvents {
  /**
   * Triggers when an inbound call arrives.
   * @typedef _CallAlertingEvent
   */
  CallAlerting = 'Application.CallAlerting',
  /**
   * Triggers when a session is about to terminate. Triggers in two cases:<br>
   * 1) when there are no calls and/or ACD requests in a call session. See the [session limits](/docs/guides/voxengine/limits) for details;<br>
   * 2) when the [VoxEngine.terminate](/docs/references/voxengine/voxengine/terminate) method is called. Timers and any other external resources are not available after this event is triggered,
   * but you can perform one HTTP request inside the event handler (e.g. to notify an external system about the fact that the session is finished).
   * When that request is finished (or no such request is made), the [AppEvents.Terminated] event is triggered.
   * @typedef _TerminatingEvent
   */
  Terminating = 'Application.Terminating',
  /**
   * Triggers when a session is terminated and after the [AppEvents.Terminating] event is triggered.
   * The time between these events depends on handler for [AppEvents.Terminating] event.
   * Use the event just for debugging, only the [Logger.write] method could be used in a handler.
   * @typedef _TerminatedEvent
   */
  Terminated = 'Application.Terminated',
  /**
   * The very first event is triggered due to inbound call or HTTP request to Voximplant cloud over the internet.
   * Triggers only once in a session, so if you execute the same HTTP request again it creates the new, separate session.
   * Note that usage of the event in your JS scenario is optional.
   * @typedef _StartedEvent
   */
  Started = 'Application.Started',
  /**
   * Triggers when the managing HTTP request is received by the session.
   * If you [start a call session with HTTP request](/docs/references/httpapi/managing_scenarios#startscenarios), you get an answer: an object with media\_session\_access\_url property.
   * The property's value is the managing URL for the specified session, so it can be used in managing HTTP request that triggers [AppEvents.HttpRequest] event.
   * @typedef _HttpRequestEvent
   */
  HttpRequest = 'Application.HttpRequest',

  /**
   * Triggers when there is a new connection to a WebSocket.
   * @typedef _NewWebSocketEvent
   */
  WebSocket = 'AppEvents.NewWebSocketConnection',

  /**
   * Triggers when a WebSocket fails. It can happen when the number of inbound WebSocket connections exceeds the number of calls in one session + 3.
   * @typedef _NewWebSocketFailedEvent
   */
  NewWebSocketFailed = 'Application.OnNewWebSocketFailed',
}

/**
 * @private
 */
declare interface _AppEvents {
  [AppEvents.CallAlerting]: _CallAlertingEvent;
  [AppEvents.Terminating]: _TerminatingEvent;
  [AppEvents.Terminated]: _TerminatedEvent;
  [AppEvents.Started]: _StartedEvent;
  [AppEvents.HttpRequest]: _HttpRequestEvent;
  [AppEvents.WebSocket]: _NewWebSocketEvent;
  [AppEvents.NewWebSocketFailed]: _NewWebSocketFailedEvent;
}

/**
 * @private
 */
declare interface _HttpRequestEvent {
  /**
   *  HTTP request method. E.g. POST
   */
  method: string;
  /**
   *  HTTP path requested (without the domain name). E.g. /request/1d61f27ba2faad53.1500645140.80028_185.164.148.244/eb4b0539b13e2401
   */
  path: string;
  /**
   *  HTTP request content. E.g. '{"param1": "value1", "param2": "value2"}'
   */
  content: string;
  /**
   * List of dictionaries with key and value fields representing HTTP headers (the ones starting with "X-")
   */
  headers: { key: string; value: string }[];
}


/**
 * @private
 */
declare interface _NewWebSocketFailedEvent extends _HttpRequestEvent {
  reason: string;
}

/**
 * @private
 */
declare interface _NewWebSocketEvent extends _HttpRequestEvent {
  websocket: WebSocket;
}

/**
 * @private
 */
declare interface _StartedEvent {
  /**
   * HTTP URL that can be used to send commands to this scenario from the external systems.
   */
  accessURL: string;
  /**
   * HTTPS URL that can be used to send commands to this scenario from the external systems.
   */
  accessSecureURL: string;
  /**
   * Unique identification number of the Voximplant account.
   * Can be used as one of the [authentication parameters](/docs/references/httpapi/auth_parameters) in management API methods.
   */
  accountId: number;
  /**
   * Unique identification number of Voximplant application.
   * Can be used in [Managing Applications](/docs/references/httpapi/managing_applications) in management API methods.
   */
  applicationId: number;
  /**
   * Direct link to the call's log
   */
  logURL: string;
  /**
   * Identification number of JS session that is unique within an account and its child accounts.
   * Can be used in [Managing History](/docs/references/httpapi/managing_history) in management API methods.
   */
  sessionId: number;
  /**
   * Conference name that is passed to the conference session created via the management API.
   */
  conference_name: string;
}

/**
 * @private
 */
declare interface _TerminatedEvent {}

/**
 * @private
 */
declare interface _TerminatingEvent {}

/**
 * @private
 */
declare interface _CallAlertingEvent {
  /**
   * Inbound call that triggered the event
   */
  call: Call;
  /**
   * Name of the event - "Application.CallAlerting"
   */
  name: string;
  /**
   * CallerID for current call
   */
  callerid: string;
  /**
   * Dialed number
   */
  destination: string;
  /**
   * Dialed SIP URI
   */
  toURI: string;
  /**
   * Source CallerID with domain or SIP URI for inbound SIP call
   */
  fromURI: string;
  /**
   * Displayable name of the caller
   */
  displayName: string;
  /**
   * Custom SIP headers received with the call (the ones starting with "X-")
   */
  headers: { [header: string]: string };
  /**
   * Optional: Custom data for the current call object. It can be passed from Web SDK via the [Client.call](/docs/references/websdk/voximplant/client#call) method in the *customData* parameter.
   */
  customData: string;
  /**
   * Internal information about codecs, should be passed to the [VoxEngine.callUser], [VoxEngine.callUserDirect], [VoxEngine.callSIP], [VoxEngine.callConference], [Call.answer], [Call.answerDirect], [Call.startEarlyMedia] methods call.
   */
  scheme: string;
}

/**
 * Represents an application storage object to manipulate key-value pairs.
 *
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.ApplicationStorage);
 * ```
 */
declare class ApplicationStorage {
  /**
   * Retrieves a value of the specified key.
   * @param key Key to get
   */
  static get(key: string): Promise<StorageKey | null>;

  /**
   * Creates a key-value pair. If an already existing **key** is passed, the method updates its **value**.
   *
   * The keys should be unique within a Voximplant application.
   * @param key Key to create/update, up to 200 characters. A key can contain a namespace that is written before a colon, for example, test:1234. Thus, namespace "test" can be used as a **pattern** in the [keys](/docs/references/voxengine/applicationstorage#keys) method to find the keys with the same namespace. If no namespace is set, the key itself is considered as namespace
   * @param value Value for the specified key, up to 2000 characters
   * @param ttl Key expiry time in seconds. The value is in range of 0..7,776,000 (90 days). The TTL is converted to an `expireAt` Unix timestamp field as part of the storage object. Note that the pricing is tiered in three day-based pieces: 0-30, 31-60, 61-90. See the details [here](https://voximplant.com/pricing)
   */
  static put(key: string, value: string, ttl: number): Promise<StorageKey>;

  /**
   * Deletes the specified key. Note that the returned **StorageKey** always has zero **ttl**.
   * @param key Key to delete.
   */
  static delete(key: string): Promise<StorageKey>;

  /**
   * Retrieves all the keys assigned to a Voximplant application.
   * @param pattern Namespace that keys should contain
   */
  static keys(pattern?: string): Promise<StoragePage>;
}

/**
 * List of available dictionaries for ASR
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.ASR);
 * ```
 * @deprecated Use [ASRModelList] instead
 */
declare enum ASRDictionary {
  /**
   * ASR Russian addresses dictionary
   * @deprecated Use [ASRModelList] instead
   */
  ADDRESS_RU = 'asr-dict-address-ru',
  /**
   * ASR Turkish addresses dictionary
   * @deprecated Use [ASRModelList] instead
   */
  ADDRESS_TR = 'asr-dict-address-tr',
  /**
   * ASR addresses dictionary
   * Available languages 'ru-RU','en-US','uk-UK','tr-TR','de-DE','fr-FR','es-ES'
   * @deprecated Use [ASRModelList] instead
   */
  ADDRESS = 'asr-dict-yand-maps',
  /**
   * ASR notes dictionary
   * @deprecated Use [ASRModelList] instead
   */
  NOTES = 'asr-dict-yand-notes',
  /**
   * ASR queries dictionary
   * Available languages 'ru-RU','en-US','uk-UK','tr-TR'
   * @deprecated Use [ASRModelList] instead
   */
  SEARCH_QUERIES = 'asr-dict-yand-queries',
  /**
   * ASR music dictionary
   * @deprecated Use [ASRModelList] instead
   */
  MUSIC = 'asr-dict-yand-music',
  /**
   * ASR buying dictionary
   * @deprecated Use [ASRModelList] instead
   */
  ECOMMERCE = 'asr-dict-yand-buying',
  /**
   * ASR Russian phone numbers dictionary
   * @deprecated Use [ASRModelList] instead
   */
  NUMBERS_RU = 'asr-dict-yand-numbers',
  /**
   * ASR Russian general dictionary
   * @deprecated Use [ASRModelList] instead
   */
  GENERAL_RU = 'asr-dict-yand-general',
  /**
   * ASR Russian date dictionary
   * @deprecated Use [ASRModelList] instead
   */
  DATE_RU = 'asr-dict-yand-dates',
  /**
   * ASR Russian names dictionary
   * @deprecated Use [ASRModelList] instead
   */
  NAMES_RU = 'asr-dict-yand-names',
  /**
   * ASR Russian questionnaire dictionary
   * @deprecated Use [ASRModelList] instead
   */
  QUESTIONNAIRE_RU = 'asr-dict-yand-questionnaire',
  /**
   * ASR Russian Tinkoff dictionary
   * @deprecated Use [ASRModelList] instead
   */
  TINKOFF = 'asr-dict-tinkoff-',
}

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.ASR);
 * ```
 * @event
 */
declare enum ASREvents {
  /**
   * Triggers in case of errors during the recognition process
   * @typedef _ASRErrorEvent
   */
  ASRError = 'ASR.Error',
  /**
   * Triggers after ASR instance is created
   * @typedef _ASREvent
   */
  Started = 'ASR.Started',
  /**
   * Triggers after ASR detected voice input and started collecting audio data for ASR
   * @typedef _ASREvent
   */
  CaptureStarted = 'ASR.CaptureStarted',
  /**
   * Triggers after ASR captured audio data, before recognition process
   * @typedef _ASREvent
   */
  SpeechCaptured = 'ASR.SpeechCaptured',
  /**
   * Triggers when recognition result received from ASR. We strongly recommend to create recognition timeout manually to prevent unexpectedly long recognition time.
   * @typedef _ASRResultEvent
   */
  Result = 'ASR.Result',
  /**
   * Triggers when interim recognition result received from ASR. Note that event could be triggered only if the [ASRParameters.interimResults] option is set to **true**.
   * @typedef _ASRInterimResultEvent
   */
  InterimResult = 'ASR.InterimResult',
  /**
   * Triggers as a result of the [ASR.stop] method call
   * @typedef _ASRStoppedEvent
   */
  Stopped = 'ASR.Stopped',
}

/**
 * @private
 */
declare interface _ASREvents {
  [ASREvents.ASRError]: _ASRErrorEvent;
  [ASREvents.Started]: _ASRStartedEvent;
  [ASREvents.CaptureStarted]: _ASRCaptureStartedEvent;
  [ASREvents.SpeechCaptured]: _ASRSpeechCapturedEvent;
  [ASREvents.Result]: _ASRResultEvent;
  [ASREvents.InterimResult]: _ASRInterimResultEvent;
  [ASREvents.Stopped]: _ASRStoppedEvent;
}

/**
 * @private
 */
declare interface _ASREvent {
  /**
   * ASR instance that generated the event
   */
  asr: ASR;
}

/**
 * @private
 */
declare interface _ASRStartedEvent extends _ASREvent {}

/**
 * @private
 */
declare interface _ASRCaptureStartedEvent extends _ASREvent {}

/**
 * @private
 */
declare interface _ASRSpeechCapturedEvent extends _ASREvent {}

/**
 * @private
 */
declare interface _ASRStoppedEvent extends _ASREvent {
  /**
   * Record cost (in the account's currency: USD, EUR or RUB)
   */
  cost: string;
  /**
   * Record duration (sec)
   */
  duration: number;
}

/**
 * @private
 */
declare interface _ASRInterimResultEvent extends _ASREvent {
  /**
   * Recognition result
   */
  text: string;
}

/**
 * @private
 */
declare interface _ASRResultEvent extends _ASREvent {
  /**
   * Recognition result. Depending on the ASR provider, this parameter is called text or transcript (in rare cases).
   */
  text: string;
  /**
   * Recognition confidence. Depending on the ASR provider, can be in 0..100 or 0..1 range (100 or 1 means full confidence, 0 - not confident at all)
   */
  confidence: number;
  /**
   * Time offset of the end of this result relative to the beginning of the audio.
   */
  resultEndTime?: string | number;
  /**
   * For multichannel audio, this is the channel number corresponding to the recognized result for the audio from that channel.
   */
  channelTag?: number;
  /**
   * Output only. The BCP-47 language tag of the language in this result. This language code is detected to have the most likelihood of being spoken in the audio.
   */
  languageCode?: string;
}

/**
 * @private
 */
declare interface _ASRErrorEvent extends _ASREvent {
  /**
   * Error message
   */
  error: string;
}

/**
 * List of available languages for ASR.
 *
 * Note that the Tinkoff VoiceKit and Yandex Speechkit supports only 'ASRLanguage.RUSSIAN_RU' language.
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.ASR);
 * ```
 * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
 */
declare enum ASRLanguage {
  /**
   * English (United States)
   * @const
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_US = 'en-US',
  /**
   * English (Canada)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_CA = 'en-CA',
  /**
   * English (United Kingdom)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_UK = 'en-GB',
  /**
   * English (Australia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_AU = 'en-AU',
  /**
   * Spanish (Spain)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_ES = 'es-ES',
  /**
   * Spanish (Mexico)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_MX = 'es-MX',
  /**
   * Italian (Italy)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ITALIAN_IT = 'it-IT',
  /**
   * French (France)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FRENCH_FR = 'fr-FR',
  /**
   * French (Canada)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FRENCH_CA = 'fr-CA',
  /**
   * Polish (Poland)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  POLISH_PL = 'pl-PL',
  /**
   * Portuguese (Portugal)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  PORTUGUES_PT = 'pt-PT',
  /**
   * Catalan (Catalan)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CATALAN_ES = 'ca-ES',
  /**
   * Chinese (Taiwan)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CHINESE_TW = 'cmn-Hant-TW',
  /**
   * Danish (Denmark)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  DANISH_DK = 'da-DK',
  /**
   * German (Germany)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GERMAN_DE = 'de-DE',
  /**
   * Finnish (Finland)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FINNISH_FI = 'fi-FI',
  /**
   * Japanese (Japan)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  JAPANESE_JP = 'ja-JP',
  /**
   * Korean (Korea)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  KOREAN_KR = 'ko-KR',
  /**
   * Dutch (Netherlands)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  DUTCH_NL = 'nl-NL',
  /**
   * Norwegian (Norway)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  NORWEGIAN_NO = 'nb-NO',
  /**
   * Portuguese (Brazil)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  PORTUGUESE_BR = 'pt-BR',
  /**
   * Russian (Russia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  RUSSIAN_RU = 'ru-RU',
  /**
   * Swedish (Sweden)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SWEDISH_SE = 'sv-SE',
  /**
   * Chinese (People's Republic of China)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CHINESE_CN = 'cmn-Hans-CN',
  /**
   * Chinese (Hong Kong S.A.R.)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CHINESE_HK = 'cmn-Hans-HK',
  /**
   * Afrikaans (South Africa)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  AFRIKAANS_ZA = 'af-ZA',
  /**
   * Indonesian (Indonesia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  INDONESIAN_ID = 'id-ID',
  /**
   * Malay (Malaysia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  MALAYSIA_MY = 'ms-MY',
  /**
   * Czech (Czech Republic)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CZECH_CZ = 'cs-CZ',
  /**
   * English (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_IN = 'en-IN',
  /**
   * English (Ireland)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_IE = 'en-IE',
  /**
   * English (New Zealand)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_NZ = 'en-NZ',
  /**
   * English (Philippines)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_PH = 'en-PH',
  /**
   * English (South Africa)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_ZA = 'en-ZA',
  /**
   * Spanish (Argentina)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_AR = 'es-AR',
  /**
   * Spanish (Bolivia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_BO = 'es-BO',
  /**
   * Spanish (Chile)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_CL = 'es-CL',
  /**
   * Spanish (Colombia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_CO = 'es-CO',
  /**
   * Spanish (Costa Rica)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_CR = 'es-CR',
  /**
   * Spanish (Ecuador)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_EC = 'es-EC',
  /**
   * Spanish (El Salvador)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_SV = 'es-SV',
  /**
   * Spanish (United States)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_US = 'es-US',
  /**
   * Spanish (Guatemala)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_GT = 'es-GT',
  /**
   * Spanish (Honduras)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_HN = 'es-HN',
  /**
   * Spanish (Nicaragua)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_NI = 'es-NI',
  /**
   * Spanish (Panama)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PA = 'es-PA',
  /**
   * Spanish (Paraguay)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PY = 'es-PY',
  /**
   * Spanish (Peru)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PE = 'es-PE',
  /**
   * Spanish (Puerto Rico)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PR = 'es-PR',
  /**
   * Spanish (Republican Dominican)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_DO = 'es-DO',
  /**
   * Spanish (Uruguay)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_UY = 'es-UY',
  /**
   * Spanish (Venezuela)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_VE = 'es-VE',
  /**
   * Basque (Spain)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BASQUE_ES = 'eu-ES',
  /**
   * Filipino (Philippines)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FILIPINO_PH = 'fil-PH',
  /**
   * Galician (Spain)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GALICIAN_ES = 'gl-ES',
  /**
   * Croatian (Croatia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CROATIAN_HR = 'hr-HR',
  /**
   * Zulu (South Africa)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ZULU_ZA = 'zu-ZA',
  /**
   * Icelandic (Iceland)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ICELANDIC_IS = 'is-IS',
  /**
   * Lithuanian (Lithuania)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  LITHUANIAN_LT = 'lt-LT',
  /**
   * Hungarian (Hungary)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  HUNGARIAN_HU = 'hu-HU',
  /**
   * Romanian (Romania)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ROMANIAN_RO = 'ro-RO',
  /**
   * Slovak (Slovakia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SLOVAK_SK = 'sk-SK',
  /**
   * Slovenian (Slovenia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SLOVENIAN_SL = 'sl-SI',
  /**
   * Vietnamese (Viet Nam)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  VIETNAMESE_VN = 'vi-VN',
  /**
   * Turkish (Turkiye)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TURKISH_TR = 'tr-TR',
  /**
   * Greek (Greece)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GREEK_GR = 'el-GR',
  /**
   * Bulgarian (Bulgaria)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BULGARIAN_BG = 'bg-BG',
  /**
   * Serbian
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SERBIAN_RS = 'sr-RS',
  /**
   * Ukrainian (Ukraine)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  UKRAINIAN_UA = 'uk-UA',
  /**
   * Hebrew (Israel)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  HEBREW_IL = 'he-IL',
  /**
   * Arabic (Israel)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_IL = 'ar-IL',
  /**
   * Arabic (Jordan)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_JO = 'ar-JO',
  /**
   * Arabic (U.A.E.)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_AE = 'ar-AE',
  /**
   * Arabic (Bahrain)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_BH = 'ar-BH',
  /**
   * Arabic (Algeria)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_DZ = 'ar-DZ',
  /**
   * Arabic (Saudi Arabia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_SA = 'ar-SA',
  /**
   * Arabic (Iraq)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_IQ = 'ar-IQ',
  /**
   * Arabic (Kuwait)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_KW = 'ar-KW',
  /**
   * Arabic (Morocco)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_MA = 'ar-MA',
  /**
   * Arabic (Tunisia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_TN = 'ar-TN',
  /**
   * Arabic (Oman)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_OM = 'ar-OM',
  /**
   * Arabic (Palestinian)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_PS = 'ar-PS',
  /**
   * Arabic (Qatar)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_QA = 'ar-QA',
  /**
   * Arabic (Lebanon)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_LB = 'ar-LB',
  /**
   * Arabic (Egypt)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_EG = 'ar-EG',
  /**
   * Farsi (Iran)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FARSI_IR = 'fa-IR',
  /**
   * Hindi (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  HINDI_IN = 'hi-IN',
  /**
   * Thai (Thailand)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  THAI_TH = 'th-TH',
  /**
   * Cantonese, Traditional script, Hong Kong SAR
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CANTONESE_HK = 'yue-Hant-HK',
  /**
   * Amharic (Ethiopia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  AMHARIC_ET = 'am-ET',
  /**
   * Armenian (Armenia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARMENIAN_AM = 'hy-AM',
  /**
   * Azerbaijani (Azerbaijan)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  AZERBAIJANI_AZ = 'az-AZ',
  /**
   * Bengali (Bangladesh)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BENGALI_BD = 'bn-BD',
  /**
   * Bengali (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BENGALI_IN = 'bn-IN',
  /**
   * English (Ghana)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_GH = 'en-GH',
  /**
   * English (Kenya)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_KE = 'en-KE',
  /**
   * English (Nigeria)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_NG = 'en-NG',
  /**
   * English (Tanzania)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_TZ = 'en-TZ',
  /**
   * Georgian (Georgia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GEORGIAN_GE = 'ka-GE',
  /**
   * Gujarati (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GUJARATI_IN = 'gu-IN',
  /**
   * Javanese (Indonesia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  JAVANESE_ID = 'jv-ID',
  /**
   * Kannada (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  KANNADA_IN = 'kn-IN',
  /**
   * Khmer (Cambodia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  KHMER_KH = 'km-KH',
  /**
   * Lao (Laos)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  LAO_LA = 'lo-LA',
  /**
   * Latvian (Latvia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  LATVIAN_LV = 'lv-LV',
  /**
   * Malayalam (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  MALAYALAM_IN = 'ml-IN',
  /**
   * Marathi (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  MARATHI_IN = 'mr-IN',
  /**
   * Nepali (Nepal)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  NEPALI_NP = 'ne-NP',
  /**
   * Sinhala (Srilanka)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SINHALA_LK = 'si-LK',
  /**
   * Sundanese (Indonesia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SUNDANESE_ID = 'su-ID',
  /**
   * Swahili (Tanzania)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SWAHILI_TZ = 'sw-TZ',
  /**
   * Swahili (Kenya)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SWAHILI_KE = 'sw-KE',
  /**
   * Tamil (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_IN = 'ta-IN',
  /**
   * Tamil (Singapore)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_SG = 'ta-SG',
  /**
   * Tamil (Sri Lanka)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_LK = 'ta-LK',
  /**
   * Tamil (Malaysia)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_MY = 'ta-MY',
  /**
   * Telugu (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TELUGU_IN = 'te-IN',
  /**
   * Urdu (Pakistan)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  URDU_PK = 'ur-PK',
  /**
   * Urdu (India)
   * @warning Use [ASRLanguage] for [VoxEngine.RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  URDU_IN = 'ur-IN',
}

declare module ASRModelList {
  /**
   * List of Amazon Polly models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Amazon {
    /**
     * Best for audio that originated from a phone call (typically recorded at a 8khz sampling rate).
     * @const
     */
    default,
  }
}

/**
 * List of available ASR models.
 * Add the following line to your scenario code to use the ref folder:
 * ```
 * require(Modules.ASR);
 * ```
 * @namespace
 */
declare module ASRModelList {}

declare module ASRModelList {
  /**
   * List of Deepgram models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Deepgram {
    /**
     * The default **General** model.
     * @const
     */
    default,
    /**
     * Optimized for everyday audio processing.
     * @const
     */
    general,
    /**
     * Optimized for everyday audio processing. Applies the newest ASR module with higher accuracy.
     */
    general_enhanced,
    /**
     * Optimized for conference room settings, which include multiple speakers with a single microphone.
     * @const
     */
    meeting,
    /**
     * Optimized for conference room settings, which include multiple speakers with a single microphone. Applies the newest ASR module with higher accuracy.
     * @const
     */
    meeting_enhanced,
    /**
     * Optimized for low-bandwidth audio phone calls.
     * @const
     */
    phonecall,
    /**
     * Optimized for low-bandwidth audio phone calls. Applies the newest ASR module with higher accuracy.
     * @const
     */
    phonecall_enhanced,
    /**
     * Optimized for low-bandwidth audio clips with a single speaker. Derived from the phonecall model.
     * @const
     */
    voicemail,
    /**
     * Optimized for multiple speakers with varying audio quality, such as might be found on a typical earnings call. Vocabulary is heavily finance oriented.
     * @const
     */
    finance,
    /**
     * Optimized for multiple speakers with varying audio quality, such as might be found on a typical earnings call. Vocabulary is heavily finance oriented. Applies the newest ASR module with higher accuracy.
     * @const
     */
    finance_enhanced,
    /**
     * Optimized to allow artificial intelligence technologies, such as chatbots, to interact with people in a human-like way.
     * @const
     */
    conversational,
    /**
     * Optimized for audio sourced from videos.
     * @const
     */
    video,
  }
}

declare module ASRModelList {
  /**
   * List of Google Speech-to-Text models. The **enhanced** models cost more than the standard rate.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Google {
    /**
     * Best for audio that is not one of the specific audio models. For example, long-form audio. Ideally the audio is high-fidelity, recorded at a 16khz or greater sampling rate.
     * @const
     */
    default,

    /**
     * **Default** model with more accurate recognition.
     * @const
     */
    default_enhanced,

    /**
     * Best for short queries such as voice commands or voice search.
     * @const
     */
    command_and_search,

    /**
     * **Command_and_search** model with more accurate recognition.
     * @const
     */
    command_and_search_enhanced,

    /**
     * Best for audio that originated from a phone call (typically recorded at a 8khz sampling rate).
     * @const
     */
    phone_call,

    /**
     * **Phone_call** model with more accurate recognition.
     * @const
     */
    phone_call_enhanced,

    /**
     * Best for audio that originated from video or includes multiple speakers. Ideally the audio is recorded at a 16khz or greater sampling rate.
     * @const
     */
    video,

    /**
     * **Video** model with more accurate recognition.
     * @const
     */
    video_enhanced,
  }
}

declare module ASRModelList {
  /**
   * List of Microsoft Speech-to-text models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Microsoft {
    /**
     * Best for generic, day-to-day language and if there is little or no background noise.
     * @const
     */
    default,
  }
}

declare module ASRModelList {
  /**
   * List of SaluteSpeech models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum SaluteSpeech {
    /**
     * The default **General** model.
     * @const
     */
    default,
    /**
     * Short arbitrary phrases, e.g., search queries.
     * @const
     */
    general,
    /**
     * The model for media usage.
     * @const
     */
    media,
    /**
     * The model to use in a call center.
     * @const
     */
    callcenter,
  }
}

declare module ASRModelList {
  /**
   * List of Tinkoff VoiceKit models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Tinkoff {
    /**
     * Best for audio that originated from a phone call (typically recorded at a 8khz sampling rate).
     * @const
     */
    default,
  }
}

declare module ASRModelList {
  /**
   * List of Yandex SpeechKit models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Yandex {
    /**
     * The default **General** model.
     * @const
     */
    default,
    /**
     * Addresses, organizations, and geographical features.
     * @const
     */
    maps,
    /**
     * Short arbitrary phrases, e.g., search queries.
     * @const
     */
    general,
    /**
     * Short arbitrary phrases, e.g., search queries. Release candidate version.
     * @const
     */
    generalrc,
    /**
     * Cardinal numbers and delimiters (comma, period).
     *
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     */
    numbers,
    /**
     * Month names, cardinal and ordinal numbers.
     *
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     */
    dates,
    /**
     * People's first and last names, as well as requests to put someone on the phone.
     *
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     */
    names,
  }
}

declare module ASRModelList {
  /**
   * List of YandexV3 SpeechKit models.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum YandexV3 {
    /**
     * The default **General** model.
     * @const
     */
    default,
    /**
     * Addresses, organizations, and geographical features.
     * @const
     */
    maps,
    /**
     * Short arbitrary phrases, e.g., search queries.
     * @const
     */
    general,
    /**
     * Short arbitrary phrases, e.g., search queries. Release candidate version.
     * @const
     */
    generalrc,
    /**
     * Cardinal numbers and delimiters (comma, period).
     *
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     */
    numbers,
    /**
     * Month names, cardinal and ordinal numbers.
     *
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     */
    dates,
    /**
     * People's first and last names, as well as requests to put someone on the phone.
     *
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     */
    names,
  }
}

/**
 * List of available models for ASR.
 *
 * Note that Tinkoff VoiceKit supports only 'PHONE_CALL' model.
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.ASR);
 * ```
 * @deprecated For [ASRParameters] 'model' parameter use [ASRModelList] instead.
 */
declare enum ASRModel {
  /**
   * Best for short queries such as voice commands or voice search.
   * @const
   * @deprecated For [ASRParameters] 'model' parameter use [ASRModelList] instead.
   */
  COMMAND_AND_SEARCH = 'command_and_search',

  /**
   * Best for audio that originated from a phone call (typically recorded at a 8khz sampling rate).
   * @const
   * @deprecated For [ASRParameters] 'model' parameter use [ASRModelList] instead.
   */
  PHONE_CALL = 'phone_call',

  /**
   * Best for audio that originated from video or includes multiple speakers. Ideally the audio is recorded at a 16khz or greater sampling rate. This is a premium model that costs more than the standard rate.
   * @const
   * @deprecated For [ASRParameters] 'model' parameter use [ASRModelList] instead.
   */
  VIDEO = 'video',

  /**
   * Best for audio that is not one of the specific audio models. For example, long-form audio. Ideally the audio is high-fidelity, recorded at a 16khz or greater sampling rate.
   * @const
   * @deprecated For [ASRParameters] 'model' parameter use [ASRModelList] instead.
   */
  DEFAULT = 'default',
}

/**
 * ASR parameters.
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.ASR);
 * ```
 */
declare interface ASRParameters {
  /**
   * Profile that specifies an ASR provider and a language to use.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, Tinkoff, Yandex, YandexV3.*
   */
  profile:
    | ASRProfileList.Amazon
    | ASRProfileList.Deepgram
    | ASRProfileList.Google
    | ASRProfileList.Microsoft
    | ASRProfileList.SaluteSpeech
    | ASRProfileList.Tinkoff
    | ASRProfileList.Yandex
    | ASRProfileList.YandexV3;

  /**
   * Whether to enable interim ASR results. If set to **true**, the [ASREvents.InterimResult] triggers many times according to the speech.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
   */
  interimResults?: boolean;

  /**
   * Whether to enable single utterance. The default value is **false**, so:
   * <br>
   * 1) if the speech is shorter than 60 sec, [ASREvents.Result] is triggered in unpredictable time. You could mute the mic when the speech is over - this increases the probability of [ASREvents.Result] catching;
   * <br>
   * 2) if the speech is longer than 60 sec, [ASREvents.Result] is triggered each 60 seconds.
   * <br>
   * If it is **true**, the [ASREvents.Result] is triggered after every utterance.
   * <br>
   * <br>
   * *Available for providers: Amazon, Google, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
   * <br>
   * *Note: for the SaluteSpeech provider the default value is **true**.*
   */
  singleUtterance?: boolean;

  /**
   * Preferable words to recognize. Note that **phraseHints** do not limit the recognition to the specific list. Instead, words in the specified list has a higher chance to be selected.
   * <br>
   * <br>
   * *Available for providers: Google.*
   */
  phraseHints?: string[];

  /**
   * Recognition model. Select the model best suited to your domain to get the best results. If it is not specified, the **default** model is used.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, Tinkoff, Yandex, YandexV3.*
   */
  model?:
    | ASRModelList.Amazon
    | ASRModelList.Deepgram
    | ASRModelList.Google
    | ASRModelList.Microsoft
    | ASRModelList.SaluteSpeech
    | ASRModelList.Tinkoff
    | ASRModelList.Yandex
    | ASRModelList.YandexV3;

  /**
   * Whether to enable profanity filter. The default value is **false**.
   * <br>
   * If set to **true**, the server attempts to filter out profanities, replacing all but the initial character in each filtered word with asterisks, e.g. "f***". If set to **false** or omitted, profanities are not filtered out.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, Tinkoff, Yandex, YandexV3.*
   */
  profanityFilter?: boolean;

  /**
   * Whether to use the Google [v1p1beta1 Speech API](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech), e.g., **enableSeparateRecognitionPerChannel**, **alternativeLanguageCodes**, **enableWordTimeOffsets**, etc.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  beta: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * The recognition result contains a [_ASRResultEvent.channelTag] field to state which channel that result belongs to. If set to **false** or omitted, only the first channel is recognized.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableSeparateRecognitionPerChannel: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * A list of up to 3 additional BCP-47 language tags, listing possible alternative languages of the supplied audio. See [Language Support](https://cloud.google.com/speech-to-text/docs/languages) for a list of the currently supported language codes.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  alternativeLanguageCodes: string[];

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * If set to **true**, the top result includes a list of words and the start and end time offsets (timestamps) for those words. If set to **false** or omitted, no word-level time offset information is returned. The default value is **false**.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableWordTimeOffsets: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * If set to **true**, the top result includes a list of words and the confidence for those words. If set to **false** or omitted, no word-level confidence information is returned. The default value is **false**.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableWordConfidence: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * If set to **true**, adds punctuation to recognition result hypotheses. This feature is only available in select languages. Setting this for requests in other languages has no effect at all. The **false** value does not add punctuation to result hypotheses. The default value is **false**.
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableAutomaticPunctuation: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Config to enable speaker diarization and set additional parameters to make diarization better suited for your application.
   * <br>
   * See the full list of available fields [here](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#SpeakerDiarizationConfig).
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  diarizationConfig: {
    /**
     * If set to **true**, enables speaker detection for each recognized word in the top alternative of the recognition result.
     */
    enableSpeakerDiarization: boolean;
  };

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Metadata regarding this request.
   * <br>
   * See the full list of available fields [here](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#RecognitionMetadata).
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  metadata: {
    /**
     * The audio type that most closely describes the audio being recognized. Possible values are: **MICROPHONE_DISTANCE_UNSPECIFIED**, **NEARFIELD**, **MIDFIELD**, **FARFIELD**.
     */
    microphoneDistance: string;
  };

  /**
   * Increase the recognition model bias by assigning more weight to some phrases than others. **Phrases** is the word array, **boost** is the weight in the range of 1..20.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  speechContexts?: {
    phrases: string[];
    boost: number;
  };

  /**
   * Provide the ASR parameters directly to the provider in this parameter. Find more information in the <a href="https://voximplant.com/docs/guides/speech/stt#passing-parameters-directly-to-the-provider"> documentation</a>.
   * <br>
   * <br>
   * *Available for providers: Deepgram, Google, SaluteSpeech, Tinkoff, Yandex, YandexV3.*
   */
  request: Object;
}

declare module ASRProfileList {
  /**
   * List of Amazon Polly profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Amazon {
    /**
     * English (United Kingdom)
     * @const
     */
    en_GB,
    /**
     * English (United States)
     * @const
     */
    en_US,
    /**
     * Spanish (United States)
     * @const
     */
    es_US,
    /**
     * French (Canada)
     * @const
     */
    fr_CA,
    /**
     * French (France)
     * @const
     */
    fr_FR,
  }
}

/**
 * List of available ASR profiles.
 * Add the following line to your scenario code to use the ref folder:
 * ```
 * require(Modules.ASR);
 * ```
 * @namespace
 */
declare module ASRProfileList {}

declare module ASRProfileList {
  /**
   * List of Deepgram profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Deepgram {
    /**
     * Chinese (China)
     * @const
     */
    zh,
    /**
     * Chinese (Simplified)
     * @const
     */
    zh_CN,
    /**
     * Chinese (Traditional)
     * @const
     */
    zh_TW,
    /**
     * Danish (Denmark)
     * @const
     */
    da,
    /**
     * Dutch (Netherlands)
     * @const
     */
    nl,
    /**
     * English (Common)
     * @const
     */
    en,
    /**
     * English (Australia)
     * @const
     */
    en_AU,
    /**
     * English (Great Britain)
     * @const
     */
    en_GB,
    /**
     * English (Indonesia)
     * @const
     */
    en_IN,
    /**
     * English (New Zealand)
     * @const
     */
    en_NZ,
    /**
     * English (United States)
     * @const
     */
    en_US,
    /**
     * French (France)
     * @const
     */
    fr,
    /**
     * French (Canada)
     * @const
     */
    fr_CA,
    /**
     * German (Germany)
     * @const
     */
    de,
    /**
     * Hindi (India)
     * @const
     */
    hi,
    /**
     * Hindi (Latin)
     * @const
     */
    hi_Latn,
    /**
     * Indonesian (Indonesia)
     * @const
     */
    id,
    /**
     * Italian (Italy)
     * @const
     */
    it,
    /**
     * Japanese (Japan)
     * @const
     */
    ja,
    /**
     * Korean (Korea)
     * @const
     */
    ko,
    /**
     * Norwegian (Norway)
     * @const
     */
    no,
    /**
     * Polish (Poland)
     * @const
     */
    pl,
    /**
     * Portuguese (Common)
     * @const
     */
    pt,
    /**
     * Portuguese (Brazil)
     * @const
     */
    pt_BR,
    /**
     * Portuguese (Portugal)
     * @const
     */
    pt_PT,
    /**
     * Russian (Russia)
     * @const
     */
    ru,
    /**
     * Spanish (Spain)
     * @const
     */
    es,
    /**
     * Spanish (Latin America)
     * @const
     */
    'es-419',
    /**
     * Swedish (Sweden)
     * @const
     */
    sv,
    /**
     * Tamil (India)
     * @const
     */
    ta,
    /**
     * Turkish (Turkey)
     * @const
     */
    tr,
    /**
     * Ukrainian (Ukraine)
     * @const
     */
    uk,
  }
}

declare module ASRProfileList {
  /**
   * List of Google Speech-to-Text profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Google {
    /**
     * Afrikaans (South Africa)
     * @const
     */
    af_ZA,

    /**
     * Albanian (Albania)
     * @const
     */
    sq_AL,

    /**
     * Amharic (Ethiopia)
     * @const
     */
    am_ET,

    /**
     * Arabic (Algeria)
     * @const
     */
    ar_DZ,

    /**
     * Arabic (Bahrain)
     * @const
     */
    ar_BH,

    /**
     * Arabic (Egypt)
     * @const
     */
    ar_EG,

    /**
     * Arabic (Iraq)
     * @const
     */
    ar_IQ,

    /**
     * Arabic (Israel)
     * @const
     */
    ar_IL,

    /**
     * Arabic (Jordan)
     * @const
     */
    ar_JO,

    /**
     * Arabic (Kuwait)
     * @const
     */
    ar_KW,

    /**
     * Arabic (Lebanon)
     * @const
     */
    ar_LB,

    /**
     * Arabic (Mauritania)
     * @const
     */
    ar_MR,

    /**
     * Arabic (Morocco)
     * @const
     */
    ar_MA,

    /**
     * Arabic (Oman)
     * @const
     */
    ar_OM,

    /**
     * Arabic (Qatar)
     * @const
     */
    ar_QA,

    /**
     * Arabic (Saudi Arabia)
     * @const
     */
    ar_SA,

    /**
     * Arabic (State of Palestine)
     * @const
     */
    ar_PS,

    /**
     * Arabic (Tunisia)
     * @const
     */
    ar_TN,

    /**
     * Arabic (United Arab Emirates)
     * @const
     */
    ar_AE,

    /**
     * Arabic (Yemen)
     * @const
     */
    ar_YE,

    /**
     * Armenian (Armenia)
     * @const
     */
    hy_AM,

    /**
     * Azerbaijani (Azerbaijan)
     * @const
     */
    az_AZ,

    /**
     * Basque (Spain)
     * @const
     */
    eu_ES,

    /**
     * Bengali (Bangladesh)
     * @const
     */
    bn_BD,

    /**
     * Bengali (India)
     * @const
     */
    bn_IN,

    /**
     * Bosnian (Bosnia and Herzegovina)
     * @const
     */
    bs_BA,

    /**
     * Bulgarian (Bulgaria)
     * @const
     */
    bg_BG,

    /**
     * Burmese (Myanmar)
     * @const
     */
    my_MM,

    /**
     * Catalan (Spain)
     * @const
     */
    ca_ES,

    /**
     * Chinese, Cantonese (Traditional Hong Kong)
     * @const
     */
    yue_Hant_HK,

    /**
     * Chinese, Mandarin (Simplified, China)
     * @const
     */
    cmn_Hans_CN,

    /**
     * Chinese (Hong Kong S.A.R.)
     * @const
     */
    cmn_Hans_HK,

    /**
     * Chinese, Mandarin (Traditional, Taiwan)
     * @const
     */
    cmn_Hant_TW,

    /**
     * Croatian (Croatia)
     * @const
     */
    hr_HR,

    /**
     * Czech (Czech Republic)
     * @const
     */
    cs_CZ,

    /**
     * Danish (Denmark)
     * @const
     */
    da_DK,

    /**
     * Norwegian (Norway)
     * @const
     */
    nb_NO,

    /**
     * Dutch (Belgium)
     * @const
     */
    nl_BE,

    /**
     * Dutch (Netherlands)
     * @const
     */
    nl_NL,

    /**
     * English (Australia)
     * @const
     */
    en_AU,

    /**
     * English (Canada)
     * @const
     */
    en_CA,

    /**
     * English (Ghana)
     * @const
     */
    en_GH,

    /**
     * English (Hong Kong)
     * @const
     */
    en_HK,

    /**
     * English (India)
     * @const
     */
    en_IN,

    /**
     * English (Ireland)
     * @const
     */
    en_IE,

    /**
     * English (Kenya)
     * @const
     */
    en_KE,

    /**
     * English (New Zealand)
     * @const
     */
    en_NZ,

    /**
     * English (Nigeria)
     * @const
     */
    en_NG,

    /**
     * English (Pakistan)
     * @const
     */
    en_PK,

    /**
     * English (Philippines)
     * @const
     */
    en_PH,

    /**
     * English (Singapore)
     * @const
     */
    en_SG,

    /**
     * English (South Africa)
     * @const
     */
    en_ZA,

    /**
     * English (Tanzania)
     * @const
     */
    en_TZ,

    /**
     * English (United Kingdom)
     * @const
     */
    en_GB,

    /**
     * English (United States)
     * @const
     */
    en_US,

    /**
     * Estonian (Estonia)
     * @const
     */
    et_EE,

    /**
     * Filipino (Philippines)
     * @const
     */
    fil_PH,

    /**
     * Finnish (Finland)
     * @const
     */
    fi_FI,

    /**
     * French (Belgium)
     * @const
     */
    fr_BE,

    /**
     * French (Canada)
     * @const
     */
    fr_CA,

    /**
     * French (France)
     * @const
     */
    fr_FR,

    /**
     * French (Switzerland)
     * @const
     */
    fr_CH,

    /**
     * Galician (Spain)
     * @const
     */
    gl_ES,

    /**
     * Georgian (Georgia)
     * @const
     */
    ka_GE,

    /**
     * German (Austria)
     * @const
     */
    de_AT,

    /**
     * German (Germany)
     * @const
     */
    de_DE,

    /**
     * German (Switzerland)
     * @const
     */
    de_CH,

    /**
     * Greek (Greece)
     * @const
     */
    el_GR,

    /**
     * Gujarati (India)
     * @const
     */
    gu_IN,

    /**
     * Hebrew (Israel)
     * @const
     */
    iw_IL,

    /**
     * Hebrew (Israel)
     * @const
     */
    he_IL,

    /**
     * Hindi (India)
     * @const
     */
    hi_IN,

    /**
     * Hungarian (Hungary)
     * @const
     */
    hu_HU,

    /**
     * Icelandic (Iceland)
     * @const
     */
    is_IS,

    /**
     * Indonesian (Indonesia)
     * @const
     */
    id_ID,

    /**
     * Italian (Italy)
     * @const
     */
    it_IT,

    /**
     * Italian (Switzerland)
     * @const
     */
    it_CH,

    /**
     * Japanese (Japan)
     * @const
     */
    ja_JP,

    /**
     * Javanese (Indonesia)
     * @const
     */
    jv_ID,

    /**
     * Kannada (India)
     * @const
     */
    kn_IN,

    /**
     * Kazakh (Kazakhstan)
     * @const
     */
    kk_KZ,

    /**
     * Khmer (Cambodia)
     * @const
     */
    km_KH,

    /**
     * Korean (South Korea)
     * @const
     */
    ko_KR,

    /**
     * Lao (Laos)
     * @const
     */
    lo_LA,

    /**
     * Latvian (Latvia)
     * @const
     */
    lv_LV,

    /**
     * Lithuanian (Lithuania)
     * @const
     */
    lt_LT,

    /**
     * Macedonian (North Macedonia)
     * @const
     */
    mk_MK,

    /**
     * Malay (Malaysia)
     * @const
     */
    ms_MY,

    /**
     * Malayalam (India)
     * @const
     */
    ml_IN,

    /**
     * Marathi (India)
     * @const
     */
    mr_IN,

    /**
     * Mongolian (Mongolia)
     * @const
     */
    mn_MN,

    /**
     * Nepali (Nepal)
     * @const
     */
    ne_NP,

    /**
     * Norwegian Bokmål (Norway)
     * @const
     */
    no_NO,

    /**
     * Persian (Iran)
     * @const
     */
    fa_IR,

    /**
     * Polish (Poland)
     * @const
     */
    pl_PL,

    /**
     * Portuguese (Brazil)
     * @const
     */
    pt_BR,

    /**
     * Portuguese (Portugal)
     * @const
     */
    pt_PT,

    /**
     * Punjabi (Gurmukhi India)
     * @const
     */
    pa_Guru_IN,

    /**
     * Romanian (Romania)
     * @const
     */
    ro_RO,

    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,

    /**
     * Kinyarwanda (Rwanda)
     * @const
     */
    rw_RW,

    /**
     * Serbian (Serbia)
     * @const
     */
    sr_RS,

    /**
     * Sinhala (Sri Lanka)
     * @const
     */
    si_LK,

    /**
     * Slovak (Slovakia)
     * @const
     */
    sk_SK,

    /**
     * Slovenian (Slovenia)
     * @const
     */
    sl_SI,

    /**
     * Southern Sotho (South Africa)
     * @const
     */
    st_ZA,

    /**
     * Spanish (Argentina)
     * @const
     */
    es_AR,

    /**
     * Spanish (Bolivia)
     * @const
     */
    es_BO,

    /**
     * Spanish (Chile)
     * @const
     */
    es_CL,

    /**
     * Spanish (Colombia)
     * @const
     */
    es_CO,

    /**
     * Spanish (Costa Rica)
     * @const
     */
    es_CR,

    /**
     * Spanish (Dominican Republic)
     * @const
     */
    es_DO,

    /**
     * Spanish (Ecuador)
     * @const
     */
    es_EC,

    /**
     * Spanish (El Salvador)
     * @const
     */
    es_SV,

    /**
     * Spanish (Guatemala)
     * @const
     */
    es_GT,

    /**
     * Spanish (Honduras)
     * @const
     */
    es_HN,

    /**
     * Spanish (Mexico)
     * @const
     */
    es_MX,

    /**
     * Spanish (Nicaragua)
     * @const
     */
    es_NI,

    /**
     * Spanish (Panama)
     * @const
     */
    es_PA,

    /**
     * Spanish (Paraguay)
     * @const
     */
    es_PY,

    /**
     * Spanish (Peru)
     * @const
     */
    es_PE,

    /**
     * Spanish (Puerto Rico)
     * @const
     */
    es_PR,

    /**
     * Spanish (Spain)
     * @const
     */
    es_ES,

    /**
     * Spanish (United States)
     * @const
     */
    es_US,

    /**
     * Spanish (Uruguay)
     * @const
     */
    es_UY,

    /**
     * Spanish (Venezuela)
     * @const
     */
    es_VE,

    /**
     * Sundanese (Indonesia)
     * @const
     */
    su_ID,

    /**
     * Swahili (Kenya)
     * @const
     */
    sw_KE,

    /**
     * Swahili (Tanzania)
     * @const
     */
    sw_TZ,

    /**
     * Swedish (Sweden)
     * @const
     */
    sv_SE,

    /**
     * Tamil (India)
     * @const
     */
    ta_IN,

    /**
     * Tamil (Malaysia)
     * @const
     */
    ta_MY,

    /**
     * Tamil (Singapore)
     * @const
     */
    ta_SG,

    /**
     * Tamil (Sri Lanka)
     * @const
     */
    ta_LK,

    /**
     * Telugu (India)
     * @const
     */
    te_IN,

    /**
     * Thai (Thailand)
     * @const
     */
    th_TH,

    /**
     * Turkish (Turkey)
     * @const
     */
    tr_TR,

    /**
     * Tsonga (South Africa)
     * @const
     */
    ts_ZA,

    /**
     * Ukrainian (Ukraine)
     * @const
     */
    uk_UA,

    /**
     * Urdu (India)
     * @const
     */
    ur_IN,

    /**
     * Urdu (Pakistan)
     * @const
     */
    ur_PK,

    /**
     * Uzbek (Uzbekistan)
     * @const
     */
    uz_UZ,

    /**
     * Venda (South Africa)
     * @const
     */
    ve_ZA,

    /**
     * Vietnamese (Vietnam)
     * @const
     */
    vi_VN,

    /**
     * isiXhosa (South Africa)
     * @const
     */
    xh_ZA,

    /**
     * Zulu (South Africa)
     * @const
     */
    zu_ZA,
  }
}

declare module ASRProfileList {
  /**
   * List of Microsoft Speech-to-text profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Microsoft {
    /**
     * Afrikaans (South Africa)
     * @const
     */
    af_ZA,

    /**
     * Amharic (Ethiopia)
     * @const
     */
    am_ET,

    /**
     * Arabic (United Arab Emirates)
     * @const
     */
    ar_AE,

    /**
     * Arabic (Bahrain)
     * @const
     */
    ar_BH,

    /**
     * Arabic (Algeria)
     * @const
     */
    ar_DZ,

    /**
     * Arabic (Egypt)
     * @const
     */
    ar_EG,

    /**
     * Arabic (Israel)
     * @const
     */
    ar_IL,

    /**
     * Arabic (Iraq)
     * @const
     */
    ar_IQ,

    /**
     * Arabic (Jordan)
     * @const
     */
    ar_JO,

    /**
     * Arabic (Kuwait)
     * @const
     */
    ar_KW,

    /**
     * Arabic (Lebanon)
     * @const
     */
    ar_LB,

    /**
     * Arabic (Libya)
     * @const
     */
    ar_LY,

    /**
     * Arabic (Morocco)
     * @const
     */
    ar_MA,

    /**
     * Arabic (Oman)
     * @const
     */
    ar_OM,

    /**
     * Arabic (Palestinian Territories)
     * @const
     */
    ar_PS,

    /**
     * Arabic (Qatar)
     * @const
     */
    ar_QA,

    /**
     * Arabic (Saudi Arabia)
     * @const
     */
    ar_SA,

    /**
     * Arabic (Syria)
     * @const
     */
    ar_SY,

    /**
     * Arabic (Tunisia)
     * @const
     */
    ar_TN,

    /**
     * Arabic (Yemen)
     * @const
     */
    ar_YE,

    /**
     * Azerbaijani (Latin, Azerbaijan)
     * @const
     */
    az_AZ,

    /**
     * Bulgarian (Bulgaria)
     * @const
     */
    bg_BG,

    /**
     * Bengali (India)
     * @const
     */
    bn_IN,

    /**
     * Bosnian (Bosnia and Herzegovina)
     * @const
     */
    bs_BA,

    /**
     * Catalan (Spain)
     * @const
     */
    ca_ES,

    /**
     * Czech (Czechia)
     * @const
     */
    cs_CZ,

    /**
     * Welsh (United Kingdom)
     * @const
     */
    cy_GB,

    /**
     * Danish (Denmark)
     * @const
     */
    da_DK,

    /**
     * German (Austria)
     * @const
     */
    de_AT,

    /**
     * German (Switzerland)
     * @const
     */
    de_CH,

    /**
     * German (Germany)
     * @const
     */
    de_DE,

    /**
     * Greek (Greece)
     * @const
     */
    el_GR,

    /**
     * English (Australia)
     * @const
     */
    en_AU,

    /**
     * English (Canada)
     * @const
     */
    en_CA,

    /**
     * English (United Kingdom)
     * @const
     */
    en_GB,

    /**
     * English (Ghana)
     * @const
     */
    en_GH,

    /**
     * English (Hong Kong SAR)
     * @const
     */
    en_HK,

    /**
     * English (Ireland)
     * @const
     */
    en_IE,

    /**
     * English (India)
     * @const
     */
    en_IN,

    /**
     * English (Kenya)
     * @const
     */
    en_KE,

    /**
     * English (Nigeria)
     * @const
     */
    en_NG,

    /**
     * English (New Zealand)
     * @const
     */
    en_NZ,

    /**
     * English (Philippines)
     * @const
     */
    en_PH,

    /**
     * English (Singapore)
     * @const
     */
    en_SG,

    /**
     * English (Tanzania)
     * @const
     */
    en_TZ,

    /**
     * English (United States)
     * @const
     */
    en_US,

    /**
     * English (South Africa)
     * @const
     */
    en_ZA,

    /**
     * Spanish (Argentina)
     * @const
     */
    es_AR,

    /**
     * Spanish (Bolivia)
     * @const
     */
    es_BO,

    /**
     * Spanish (Chile)
     * @const
     */
    es_CL,

    /**
     * Spanish (Colombia)
     * @const
     */
    es_CO,

    /**
     * Spanish (Costa Rica)
     * @const
     */
    es_CR,

    /**
     * Spanish (Cuba)
     * @const
     */
    es_CU,

    /**
     * Spanish (Dominican Republic)
     * @const
     */
    es_DO,

    /**
     * Spanish (Ecuador)
     * @const
     */
    es_EC,

    /**
     * Spanish (Spain)
     * @const
     */
    es_ES,

    /**
     * Spanish (Equatorial Guinea)
     * @const
     */
    es_GQ,

    /**
     * Spanish (Guatemala)
     * @const
     */
    es_GT,

    /**
     * Spanish (Honduras)
     * @const
     */
    es_HN,

    /**
     * Spanish (Mexico)
     * @const
     */
    es_MX,

    /**
     * Spanish (Nicaragua)
     * @const
     */
    es_NI,

    /**
     * Spanish (Panama)
     * @const
     */
    es_PA,

    /**
     * Spanish (Peru)
     * @const
     */
    es_PE,

    /**
     * Spanish (Puerto Rico)
     * @const
     */
    es_PR,

    /**
     * Spanish (Paraguay)
     * @const
     */
    es_PY,

    /**
     * Spanish (El Salvador)
     * @const
     */
    es_SV,

    /**
     * Spanish (United States)
     * @const
     */
    es_US,

    /**
     * Spanish (Uruguay)
     * @const
     */
    es_UY,

    /**
     * Spanish (Venezuela)
     * @const
     */
    es_VE,

    /**
     * Estonian (Estonia)
     * @const
     */
    et_EE,

    /**
     * Basque
     * @const
     */
    eu_ES,

    /**
     * Persian (Iran)
     * @const
     */
    fa_IR,

    /**
     * Finnish (Finland)
     * @const
     */
    fi_FI,

    /**
     * Filipino (Philippines)
     * @const
     */
    fil_PH,

    /**
     * French (Belgium)
     * @const
     */
    fr_BE,

    /**
     * French (Canada)
     * @const
     */
    fr_CA,

    /**
     * French (Switzerland)
     * @const
     */
    fr_CH,

    /**
     * French (France)
     * @const
     */
    fr_FR,

    /**
     * Irish (Ireland)
     * @const
     */
    ga_IE,

    /**
     * Galician
     * @const
     */
    gl_ES,

    /**
     * Gujarati (India)
     * @const
     */
    gu_IN,

    /**
     * Hebrew (Israel)
     * @const
     */
    he_IL,

    /**
     * Hindi (India)
     * @const
     */
    hi_IN,

    /**
     * Croatian (Croatia)
     * @const
     */
    hr_HR,

    /**
     * Hungarian (Hungary)
     * @const
     */
    hu_HU,

    /**
     * Armenian (Armenia)
     * @const
     */
    hy_AM,

    /**
     * Indonesian (Indonesia)
     * @const
     */
    id_ID,

    /**
     * Icelandic (Iceland)
     * @const
     */
    is_IS,

    /**
     * Italian (Switzerland)
     * @const
     */
    it_CH,

    /**
     * Italian (Italy)
     * @const
     */
    it_IT,

    /**
     * Japanese (Japan)
     * @const
     */
    ja_JP,

    /**
     * Javanese (Latin, Indonesia)
     * @const
     */
    jv_ID,

    /**
     * Georgian (Georgia)
     * @const
     */
    ka_GE,

    /**
     * Kazakh (Kazakhstan)
     * @const
     */
    kk_KZ,

    /**
     * Khmer (Cambodia)
     * @const
     */
    km_KH,

    /**
     * Kannada (India)
     * @const
     */
    kn_IN,

    /**
     * Korean (Korea)
     * @const
     */
    ko_KR,

    /**
     * Lao (Laos)
     * @const
     */
    lo_LA,

    /**
     * Lithuanian (Lithuania)
     * @const
     */
    lt_LT,

    /**
     * Latvian (Latvia)
     * @const
     */
    lv_LV,

    /**
     * Macedonian (North Macedonia)
     * @const
     */
    mk_MK,

    /**
     * Malayalam (India)
     * @const
     */
    ml_IN,

    /**
     * Mongolian (Mongolia)
     * @const
     */
    mn_MN,

    /**
     * Marathi (India)
     * @const
     */
    mr_IN,

    /**
     * Malay (Malaysia)
     * @const
     */
    ms_MY,

    /**
     * Maltese (Malta)
     * @const
     */
    mt_MT,

    /**
     * Burmese (Myanmar)
     * @const
     */
    my_MM,

    /**
     * Norwegian (Bokmål, Norway)
     * @const
     */
    nb_NO,

    /**
     * Nepali (Nepal)
     * @const
     */
    ne_NP,

    /**
     * Dutch (Belgium)
     * @const
     */
    nl_BE,

    /**
     * Dutch (Netherlands)
     * @const
     */
    nl_NL,

    /**
     * Polish (Poland)
     * @const
     */
    pl_PL,

    /**
     * Pashto (Afghanistan)
     * @const
     */
    ps_AF,

    /**
     * Portuguese (Brazil)
     * @const
     */
    pt_BR,

    /**
     * Portuguese (Portugal)
     * @const
     */
    pt_PT,

    /**
     * Romanian (Romania)
     * @const
     */
    ro_RO,

    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,

    /**
     * Sinhala (Sri Lanka)
     * @const
     */
    si_LK,

    /**
     * Slovak (Slovakia)
     * @const
     */
    sk_SK,

    /**
     * Slovenian (Slovenia)
     * @const
     */
    sl_SI,

    /**
     * Somali (Somalia)
     * @const
     */
    so_SO,

    /**
     * Albanian (Albania)
     * @const
     */
    sq_AL,

    /**
     * Serbian (Cyrillic, Serbia)
     * @const
     */
    sr_RS,

    /**
     * Swedish (Sweden)
     * @const
     */
    sv_SE,

    /**
     * Swahili (Kenya)
     * @const
     */
    sw_KE,

    /**
     * Swahili (Tanzania)
     * @const
     */
    sw_TZ,

    /**
     * Tamil (India)
     * @const
     */
    ta_IN,

    /**
     * Telugu (India)
     * @const
     */
    te_IN,

    /**
     * Thai (Thailand)
     * @const
     */
    th_TH,

    /**
     * Turkish (Turkey)
     * @const
     */
    tr_TR,

    /**
     * Ukrainian (Ukraine)
     * @const
     */
    uk_UA,

    /**
     * Uzbek (Latin, Uzbekistan)
     * @const
     */
    uz_UZ,

    /**
     * Vietnamese (Vietnam)
     * @const
     */
    vi_VN,

    /**
     * Chinese (Wu, Simplified)
     * @const
     */
    wuu_CN,

    /**
     * Chinese (Cantonese, Simplified)
     * @const
     */
    yue_CN,

    /**
     * Chinese (Mandarin, Simplified)
     * @const
     */
    zh_CN,

    /**
     * Chinese (Cantonese, Traditional)
     * @const
     */
    zh_HK,

    /**
     * Chinese (Taiwanese Mandarin, Traditional)
     * @const
     */
    zh_TW,

    /**
     * Zulu (South Africa)
     * @const
     */
    zu_ZA,
  }
}

declare module ASRProfileList {
  /**
   * List of SaluteSpeech profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum SaluteSpeech {
    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,
  }
}

declare module ASRProfileList {
  /**
   * List of Tinkoff VoiceKit profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Tinkoff {
    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,
  }
}

declare module ASRProfileList {
  /**
   * List of Yandex SpeechKit profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum Yandex {
    /**
     * Automatic language recognition
     * @const
     */
    auto,
    /**
     * German (Germany)
     * @const
     */
    de_DE,
    /**
     * English (United States)
     * @const
     */
    en_US,
    /**
     * Spanish (Spain)
     * @const
     */
    es_ES,
    /**
     * Finnish (Finland)
     * @const
     */
    fi_FI,
    /**
     * French (France)
     * @const
     */
    fr_FR,
    /**
     * Italian (Italy)
     * @const
     */
    it_IT,
    /**
     * Kazakh (Kazakhstan)
     * @const
     */
    kk_KK,
    /**
     * Dutch (Holland)
     * @const
     */
    nl_NL,
    /**
     * Polish (Poland)
     * @const
     */
    pl_PL,
    /**
     * Portuguese (Portugal)
     * @const
     */
    pt_PT,
    /**
     * Portuguese (Brazilian)
     * @const
     */
    pt_BR,
    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,
    /**
     * Swedish (Sweden)
     * @const
     */
    sv_SE,
    /**
     * Turkish (Turkey)
     * @const
     */
    tr_TR,
    /**
     * Uzbek (Uzbekistan)
     * @const
     */
    uz_UZ,
  }
}

declare module ASRProfileList {
  /**
   * List of YandexV3 SpeechKit profiles.
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum YandexV3 {
    /**
     * Automatic language recognition
     * @const
     */
    auto,
    /**
     * German (Germany)
     * @const
     */
    de_DE,
    /**
     * English (United States)
     * @const
     */
    en_US,
    /**
     * Spanish (Spain)
     * @const
     */
    es_ES,
    /**
     * Finnish (Finland)
     * @const
     */
    fi_FI,
    /**
     * French (France)
     * @const
     */
    fr_FR,
    /**
     * Italian (Italy)
     * @const
     */
    it_IT,
    /**
     * Kazakh (Kazakhstan)
     * @const
     */
    kk_KK,
    /**
     * Dutch (Holland)
     * @const
     */
    nl_NL,
    /**
     * Polish (Poland)
     * @const
     */
    pl_PL,
    /**
     * Portuguese (Portugal)
     * @const
     */
    pt_PT,
    /**
     * Portuguese (Brazilian)
     * @const
     */
    pt_BR,
    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,
    /**
     * Swedish (Sweden)
     * @const
     */
    sv_SE,
    /**
     * Turkish (Turkey)
     * @const
     */
    tr_TR,
    /**
     * Uzbek (Uzbekistan)
     * @const
     */
    uz_UZ,
  }
}

/**
ASR class provides speech recognition capabilities. Audio stream can be sent to an ASR instance from [Call], [Player] or [Conference] objects. Language or dictionary should be passed to the [VoxEngine.createASR] function.

Add the following line to your scenario code to use the class:
```
require(Modules.ASR);
```
**/
declare class ASR {
  /**
   * @param id
   * @param lang
   * @param dict
   */
  constructor(id: string, lang: string, dict: string);

  /**
   * Adds a handler for the specified [ASREvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [ASREvents.Stopped])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  public addEventListener<T extends keyof _ASREvents>(
    event: ASREvents | T,
    callback: (ev: _ASREvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [ASREvents] event
   * @param event Event class (i.e., [ASREvents.Stopped])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  public removeEventListener<T extends keyof _ASREvents>(
    event: ASREvents | T,
    callback?: (ev: _ASREvents[T]) => any
  ): void;

  /**
   * Stops recognition. Triggers the [ASREvents.Stopped] event. Do not call any other ASR functions/handlers after the **ASR.stop** call.
   */
  stop(): void;
}

/**
 * Decodes the data in the Base64 encoding
 * @param data Data to decode
 */
declare function base64_decode(data: string): number[];

/**
 * Encodes a string or array of integers from 0 to 255 to the Base64 encoding
 * @param data String or array of integers from 0 to 255 to encode
 */
declare function base64_encode(data: string | number[]): string;

/**
 * Creates a hex string from given bytes array.
 * @param data Array of numbers to convert into a string
 * @param toUpperCase Whether the resulting string has uppercase 'A-F' chars. Default is 'false'.
 */
declare function bytes2hex(data: number[], toUpperCase: boolean): string;

/**
 * Creates a string from an array of numbers with specified encoding
 * @param data Array of integers from 0 to 255 to create a string from
 * @param encoding Encoding to use for string creation, the default value is "utf-8".
 */
declare function bytes2str(data: number[], encoding: string): string;

/**
 * @event
 */
declare enum CallEvents {
  /**
   * Triggers after remote peer answered the call or set the call into the [Call.startEarlyMedia] state. Note that event is not triggered in P2P mode.
   * @typedef _AudioStartedEvent
   * */
  AudioStarted = 'Call.AudioStarted',
  /**
   * Triggers when blind transfers are enabled by [Call.handleBlindTransfer].
   * @typedef _BlindTransferRequestedEvent
   */
  BlindTransferRequested = 'Call.BlindTransferRequested',
  /**
   * Triggers after an inbound/outbound call is connected. For inbound call, it happens after the [Call.answer] is called. For outbound call, it happens when a remote peer answers the call.
   * @typedef _ConnectedEvent
   */
  Connected = 'Call.Connected',
  /**
   * Triggers when a call is terminated.
   * Most frequent status codes (returned when a call is terminated before being answered):<br>
   * <table class="b-list" style="margin-top:10px">
   * <thead><tr><th>Code</th><th>Description</th></tr></thead>
   * <tbody>
   * <tr><td>408</td><td>Call is not answered within 60 seconds</td></tr>
   * <tr><td>603</td><td>Call is rejected</td></tr>
   * <tr><td>486</td><td>Destination number is busy</td></tr>
   * <tr><td>487</td><td>Request terminated</td></tr>
   * </tbody>
   * </table>
   * Note that this event does not mean the end of the JavaScript session.
   * The session without calls and/or ACD requests are automatically terminated after some time (see the [session limits](/docs/guides/voxengine/limits) for details).
   * It is a good idea to explicitly terminate the session with [VoxEngine.terminate](/docs/references/voxengine/voxengine/terminate) after it is no longer needed.
   * @typedef _DisconnectedEvent
   */
  Disconnected = 'Call.Disconnected',
  /**
   * Triggers when an outbound call is terminated before connection.
   * Most frequent status codes:<br>
   * <table class="b-list" style="margin-top:10px">
   * <thead><tr><th>Code</th><th>Description</th></tr></thead>
   * <tbody>
   * <tr><td>486</td><td>Destination number is busy</td></tr>
   * <tr><td>487</td><td>Request terminated</td></tr>
   * <tr><td>404</td><td>Invalid number</td></tr>
   * <tr><td>480</td><td>Destination number is unavailable</td></tr>
   * <tr><td>402</td><td>Insufficient funds</td></tr>
   * <tr><td>603</td><td>Call was rejected</td></tr>
   * <tr><td>408</td><td>Call was not answered within 60 seconds</td></tr>
   * </tbody>
   * </table>
   * @typedef _FailedEvent
   */
  Failed = 'Call.Failed',
  /**
   * Triggers when the first video packet is received.
   * @typedef _VideoFirstPacketEvent
   */
  FirstVideoPacket = 'Call.Video.FirstPacket',
  /**
   * Triggers when an INFO message is received.
   * @typedef _InfoReceivedEvent
   */
  InfoReceived = 'Call.InfoReceived',
  /**
   * Triggers when a text message is received.
   * @typedef _MessageReceivedEvent
   */
  MessageReceived = 'Call.MessageReceived',
  /**
   * Triggers each time when microphone status changes. There is the method for enabling status analyzing - [Call.handleMicStatus].
   * @typedef _MicStatusChangeEvent
   * */
  MicStatusChange = 'Call.MicStatusChange',
  /**
   * Triggers when a call is taken off hold.
   * @typedef _OffHoldEvent
   */
  OffHold = 'Call.OffHold',
  /**
   * Triggers when a call is put on hold.
   * @typedef _OnHoldEvent
   */
  OnHold = 'Call.OnHold',
  /**
   * Triggers when the audio/voice playback is completed.
   * Note that the [Call.stopPlayback] method finishes any media, so the PlaybackFinished event is not triggered. The playback may be started by the [Call.say] or [Call.startPlayback] methods.
   * @typedef _PlaybackFinishedEvent
   */
  PlaybackFinished = 'Call.PlaybackFinished',
  /**
   * Triggers by the [Call.startPlayback] and [Call.say] methods when:<br>
   * 1) the audio file download to the Voximpant cache is finished;<br>
   * 2) the audio file is found in the cache (i.e., it is in the cache before).
   * @typedef _PlaybackReadyEvent
   */
  PlaybackReady = 'Call.PlaybackReady',
  /**
   * Triggers by the [Call.startPlayback] and [Call.say] methods when audio/voice playback is started.
   * @typedef _PlaybackStartedEvent
   */
  PlaybackStarted = 'Call.PlaybackStarted',
  /**
   * Triggers when a push notification is sent.
   * @typedef _PushSentEvent
   */
  PushSent = 'Call.PushSent',
  /**
   * Triggers when the Voximplant cloud receives the ReInviteAccepted message. This message means that a call received video from the other participant.
   * @typedef _ReInviteAcceptedEvent
   */
  ReInviteAccepted = 'Call.ReInviteAccepted',
  /**
   * Triggers when the Voximplant cloud receives the ReInviteReceived message. This message means that a caller:<br>
   * 1) started sending video;<br>
   * 2) started/stopped screensharing;<br>
   * 3) put a call on hold / took a call off hold.
   * @typedef _ReInviteReceivedEvent
   */
  ReInviteReceived = 'Call.ReInviteReceived',
  /**
   * Triggers when the Voximplant cloud receives the ReInviteRejected message. This message means that a call does not receive video from the other participant.
   * @typedef _ReInviteRejectedEvent
   */
  ReInviteRejected = 'Call.ReInviteRejected',
  /**
   * Triggers in case of errors during the recording process.
   * @typedef _RecordErrorEvent
   */
  RecordError = 'Call.RecordError',
  /**
   * Triggers when call recording is started as a result of the [Call.record] method call.
   * @typedef _RecordStartedEvent
   */
  RecordStarted = 'Call.RecordStarted',
  /**
   * Triggers when call recording is stopped. This happens after the [CallEvents.Disconnected] event is triggered.
   * @typedef _RecordStoppedEvent
   */
  RecordStopped = 'Call.RecordStopped',
  /**
   * Triggers after outbound call receives progress signal from a remote peer.
   * @typedef _RingingEvent
   */
  Ringing = 'Call.Ringing',
  /**
   * Triggers when a call status is changed.
   * @typedef _StateChangedEvent
   */
  StateChanged = 'Call.StateChanged',
  /**
   * Triggers when call statistic changed.
   * @deprecated
   * @typedef _StatisticsEvent
   */
  Statistics = 'Call.Statistics',
  /**
   * Triggers when a call dial tone is detected (either dial tone or busy tone).
   * There is the deprecated method for enabling the tone detection - 'Call.detectProgressTone'. Note that:<br>
   * 1) triggers only if the [CallEvents.Connected] event is triggered;<br>
   * 2) the event is only triggered once in a call session.
   * @typedef _ToneDetectedEvent
   */
  ToneDetected = 'Call.ToneDetected',
  /**
   * Triggers when a DTMF signal is received. Note that by default DTMF signals do not trigger this event, this behavior needs to be set explicitly via the [Call.handleTones] method.
   * @typedef _ToneReceivedEvent
   */
  ToneReceived = 'Call.ToneReceived',
  /**
   * Triggers when a call transfer is complete.
   * @typedef _TransferCompleteEvent
   */
  TransferComplete = 'Call.TransferComplete',
  /**
   * Triggers when a call transfer is failed.
   * @typedef _TransferFailedEvent
   */
  TransferFailed = 'Call.TransferFailed',
  /**
   * Triggers after the video track is created. This could happen only if the [Call.record] method with **{video: true}** parameters is called.
   * @typedef _VideoTrackCreatedEvent
   */
  VideoTrackCreated = 'Call.Video.TrackCreated',
  /**
   * Triggers after the first audio packet is received.
   * @typedef _FirstAudioPacketReceived
   */
  FirstAudioPacketReceived = 'Call.FirstAudioPacketReceived',
  /**
   * Triggers after the first video packet is received.
   * @typedef _FirstVideoPacketReceived
   */
  FirstVideoPacketReceived = 'Call.FirstVideoPacketReceived',
}

/**
 * @private
 */
declare interface _CallEvents {
  [CallEvents.AudioStarted]: _AudioStartedEvent;
  [CallEvents.BlindTransferRequested]: _BlindTransferRequestedEvent;
  [CallEvents.Connected]: _ConnectedEvent;
  [CallEvents.Disconnected]: _DisconnectedEvent;
  [CallEvents.Failed]: _FailedEvent;
  [CallEvents.FirstVideoPacket]: _VideoFirstPacketEvent;
  [CallEvents.InfoReceived]: _InfoReceivedEvent;
  [CallEvents.MessageReceived]: _MessageReceivedEvent;
  [CallEvents.MicStatusChange]: _MicStatusChangeEvent;
  [CallEvents.OffHold]: _OffHoldEvent;
  [CallEvents.OnHold]: _OnHoldEvent;
  [CallEvents.PlaybackFinished]: _PlaybackFinishedEvent;
  [CallEvents.PlaybackReady]: _PlaybackReadyEvent;
  [CallEvents.PlaybackStarted]: _PlaybackStartedEvent;
  [CallEvents.PushSent]: _PushSentEvent;
  [CallEvents.ReInviteAccepted]: _ReInviteAcceptedEvent;
  [CallEvents.ReInviteReceived]: _ReInviteReceivedEvent;
  [CallEvents.ReInviteRejected]: _ReInviteRejectedEvent;
  [CallEvents.RecordError]: _RecordErrorEvent;
  [CallEvents.RecordStarted]: _RecordStartedEvent;
  [CallEvents.RecordStopped]: _RecordStoppedEvent;
  [CallEvents.Ringing]: _RingingEvent;
  [CallEvents.StateChanged]: _StateChangedEvent;
  [CallEvents.Statistics]: _StatisticsEvent;
  [CallEvents.ToneDetected]: _ToneDetectedEvent;
  [CallEvents.ToneReceived]: _ToneReceivedEvent;
  [CallEvents.TransferComplete]: _TransferCompleteEvent;
  [CallEvents.TransferFailed]: _TransferFailedEvent;
  [CallEvents.VideoTrackCreated]: _VideoTrackCreatedEvent;
  [CallEvents.FirstAudioPacketReceived]: _FirstAudioPacketReceived;
  [CallEvents.FirstVideoPacketReceived]: _FirstVideoPacketReceived;
}

/**
 * @private
 */
declare interface _CallEvent {
  /**
   * Call that triggered the event
   */
  call: Call;
  /**
   * The name of the event
   */
  name: string;
  /**
   * The call's ID
   */
  id: string;
}

/**
 * @private
 */
declare interface _CallHeaderEvent extends _CallEvent {
  /**
   * Optional SIP headers received with the message (the ones starting with "X-")
   */
  headers?: { [header: string]: string };
}

/**
 * @private
 */
declare interface _AudioStartedEvent extends _CallHeaderEvent {}

/**
 * @private
 */
declare interface _BlindTransferRequestedEvent extends _CallHeaderEvent {
  /**
   * Username
   */
  transferTo: string;
}

/**
 * @private
 */
declare interface _ConnectedEvent extends _CallEvent {
  /**
   * Optional: Custom data that was passed from the client with call accept command
   */
  customData?: string;
  /**
   * Optional SIP headers received with the message (the ones starting with "X-")
   */
  headers: { [header: string]: string };
}

/**
 * @private
 */
declare interface _DisconnectedEvent extends _CallHeaderEvent {
  /**
   * Status code of the call (i.e., 486)
   */
  internalCode: number;
  /**
   * Reason of the call failure
   */
  reason: string;
  /**
   *  Total call duration in seconds
   */
  duration: number;
  /**
   *  Call cost in account currency
   */
  cost: number;
  /**
   *  Call direction type according to billing
   */
  direction: string;
}

/**
 * @private
 */
declare interface _FailedEvent extends _CallHeaderEvent {
  /**
   * Status code of the call (i.e., 486)
   */
  code: number;
  /**
   * Status message of call failure
   */
  reason: string;
}

/**
 * @private
 */
declare interface _CallRecordEvent extends _CallEvent {
  /**
   * Record URL
   */
  url: string;
}

/**
 * @private
 */
declare interface _VideoFirstPacketEvent extends _CallRecordEvent {}

/**
 * @private
 */
declare interface _InfoReceivedEvent extends _CallHeaderEvent {
  /**
   * MIME type of INFO message
   */
  mimeType: string;
  /**
   * Content of the message
   */
  body: string;
}

/**
 * @private
 */
declare interface _MessageReceivedEvent extends _CallHeaderEvent {
  /**
   * Content of the message
   */
  text: string;
}

/**
 * @private
 */
declare interface _MicStatusChangeEvent extends _CallEvent {
  /**
   * Whether the microphone is active
   */
  active: boolean;
}

/**
 * @private
 */
declare interface _OffHoldEvent extends _CallEvent {}

/**
 * @private
 */
declare interface _OnHoldEvent extends _CallEvent {}

/**
 * @private
 */
declare interface _PlaybackFinishedEvent extends _CallEvent {
  /**
   * Optional: Error that occurred during the playback
   */
  error?: string;
}

/**
 * @private
 */
declare interface _PlaybackReadyEvent extends _CallEvent {}

/**
 * @private
 */
declare interface _PlaybackStartedEvent extends _CallEvent {
  /**
   * Playback duration
   */
  duration: number;
}

/**
 * @private
 */
declare interface _PushSentEvent extends _CallEvent {
  /**
   *
   */
  result: string;
}

/**
 * @private
 */
declare interface _CallReInviteEvent extends _CallHeaderEvent {
  /**
   * MIME type of INFO message
   */
  mimeType: string;
  /**
   * Content of the message
   */
  body: string;
}

/**
 * @private
 */
declare interface _ReInviteAcceptedEvent extends _CallReInviteEvent {}

/**
 * @private
 */
declare interface _ReInviteReceivedEvent extends _CallReInviteEvent {}

/**
 * @private
 */
declare interface _ReInviteRejectedEvent extends _CallHeaderEvent {}

/**
 * @private
 */
declare interface _RecordErrorEvent extends _CallEvent {
  /**
   * Triggers in case of errors during the recording process
   */
  error: string;
}

/**
 * @private
 */
declare interface _RecordStartedEvent extends _CallEvent {
  /**
   * Link to the record file.
   */
  url: string;
}

/**
 * @private
 */
declare interface _RecordStoppedEvent extends _CallEvent {
  /**
   * Link to the record file.
   */
  url: string;
  /**
   * Record cost (in the account's currency: USD, EUR or RUB)
   */
  cost: string;
  /**
   * Record duration (sec)
   */
  duration: number;
}

/**
 * @private
 */
declare interface _RingingEvent extends _CallHeaderEvent {}

/**
 * @private
 */
declare interface _StateChangedEvent extends _CallEvent {
  oldState: string;
  newState: string;
}

/**
 * @private
 */
declare interface _StatisticsEvent extends _CallEvent {}

/**
 * @private
 */
declare interface _ToneDetectedEvent extends _CallEvent {
  /**
   * Whether the detected tone is a dial tone.
   */
  ProgressTone: boolean;
  /**
   * Whether the detected tone is a voicemail tone.
   */
  VoicemailTone: boolean;
}

/**
 * @private
 */
declare interface _ToneReceivedEvent extends _CallEvent {
  /**
   * Tone received in this event: the possible values are 0-9,*,#
   */
  tone: string;
}

/**
 * @private
 */
declare interface _TransferCompleteEvent extends _CallHeaderEvent {
  /**
   * The transfer roles. Optional.
   */
  role?: 'transferor' | 'target' | 'transferee';
}

/**
 * @private
 */
declare interface _TransferFailedEvent extends _TransferCompleteEvent {
  /**
   * Failed transfer's status (e.g., 486)
   */
  code: number;
  /**
   * Failed transfer's status message
   */
  reason: string;
}

/**
 * @private
 */
declare interface _VideoTrackCreatedEvent extends _CallRecordEvent {}

/**
 * @private
 */
declare interface _FirstAudioPacketReceived extends _CallEvent {}

/**
 * @private
 */
declare interface _FirstVideoPacketReceived extends _CallEvent {}

declare class Call {
  /**
   * Returns the current state of the call. Possible values are: TERMINATED | CONNECTED | PROGRESSING | ALERTING
   */
  state(): string;

  /**
   * Returns the human-readable description of the call's status
   */
  toString(): string;

  /**
   * Sets or gets a custom string associated with the particular call (the Call object). The customData value could be sent from WEB/iOS/Android SDKs, and then it becomes the customData value in the Call object. Note that if you receive a value from an SDK, you can always replace it manually.
   * SDKs can pass customData in two ways:<br>
   * 1) when SDK calls the Voximplant cloud</br>
   * 2) when SDK answers the call from the Voximplant cloud. See the syntax and details in the corresponding references: [WEB SDK call()](/docs/references/websdk/voximplant/client#call) / [WEB SDK answer()](/docs/references/websdk/voximplant/call#answer) / [iOS call:settings:](/docs/references/iossdk/client/viclient#callsettings) / [iOS answerWithSettings](/docs/references/iossdk/call/vicall#answerwithsettings:) / [Android call()](/docs/references/androidsdk/client/iclient#call) / [Android answer()](/docs/references/androidsdk/call/icall#answer)
   * @param cData Custom call data to set. Maximum size is 200 bytes.
   */
  customData(cData?: string): string | undefined;

  /**
   * Returns the call's id. Each call in a JavaScript session has its own unique id
   */
  id(): string;

  /**
   * Whether the call is inbound
   */
  incoming(): boolean;

  /**
   * Returns the callerID of the caller, which is displayed to the callee. Normally it is some phone number that can be used for callback. IMPORTANT: test numbers rented from Voximplant cannot be used as CallerIDs, the values can be only real numbers.
   */
  callerid(): string;

  /**
   * Returns the name of the caller, which is displayed to the callee. Normally it is a human-readable version of [Call.callerid], e.g. a person's name.
   */
  displayName(): string;

  /**
   * Returns a dialed number of the inbound or outbound call.
   */
  number(): string;

  /**
   * Returns VAD (Voice Activity Detection) status. The including of the ASR also activates VAD so in that case vad() returns true.
   */
  vad(): boolean;

  /**
   * Adds a handler for the specified [CallEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [CallEvents.Connected])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _CallEvents>(
    event: CallEvents | T,
    callback: (ev: _CallEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [CallEvents] event
   * @param event Event class (i.e., [CallEvents.Connected])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  removeEventListener<T extends keyof _CallEvents>(
    event: CallEvents | T,
    callback?: (ev: _CallEvents[T]) => any
  ): void;

  /**
   *
   */
  clientType(): string;

  /**
   * Attempts finishing the current call. Triggers one of the following events:
   * 1. [CallEvents.Disconnected] if the call is active before hangup.
   * 2. [CallEvents.Failed] if it is an outbound call that is not connected previously.
   *
   * If there are no other active calls and/or SmartQueue requests in the call session, the AppEvents.Terminating and AppEvents.Terminated events are triggered in 60 seconds (see the [session limits](/docs/guides/voxengine/limits) for details).
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the hangup request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  hangup(extraHeaders?: { [header: string]: string }): void;

  /**
   * Answers the inbound call. Use it only for non-P2P call legs connection. Remember that you can use the [Call.startEarlyMedia] method before answering a call.
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the answer request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [Connected](/docs/references/websdk/voximplant/callevents#connected) event). Example: {'X-header':'value'}
   * @param parameters Custom parameters for answering calls.
   */
  answer(
    extraHeaders?: { [header: string]: string },
    parameters?: VoxEngine.AnswerParameters
  ): void;

  /**
   * Answer the inbound call in the peer-to-peer mode. Use it only for P2P call legs connection.
   * @param peerCall The other P2P call leg.
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the answer request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the  Connected (/docs/references/websdk/enums/callevents.html#connected) event). Example: {'X-header':'value'}
   * @param parameters Custom parameters for answering calls.
   */
  answerDirect(
    peerCall: Call,
    extraHeaders?: { [header: string]: string },
    parameters?: VoxEngine.AnswerParameters
  ): void;

  /**
   * Rejects the inbound call
   * @param code SIP status code
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the reject request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g., see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   * @deprecated Use [Call.reject] instead
   */
  decline(code: number, extraHeaders?: { [header: string]: string }): void;

  /**
   * Rejects the inbound call. First it triggers the [CallEvents.Disconnected] event immediately. The [AppEvents.Terminating] and [AppEvents.Terminated] events are triggered in 60 seconds.
   * @param code SIP status code with the rejection reason. You can pass any [standard SIP code](https://en.wikipedia.org/wiki/List_of_SIP_response_codes) starting with 3xx, 4xx, 5xx and 6xx as a reject reason.
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the reject request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  reject(code: number, extraHeaders?: { [header: string]: string }): void;

  /**
   * Plays dial tones for the inbound call. The method sends a low-level command to the endpoint device to start playing dial tones for the call. So the dial tones depend on endpoint device's behavior rather than on the Voximplant cloud. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new inbound stream always replaces the previous one.
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  ring(extraHeaders?: { [header: string]: string }): void;

  /**
   * Informs the call endpoint that early media is sent before accepting the call. It allows playing voicemail prompt or music before establishing the connection. It does not allow to listen to call endpoint. Note that unanswered call can be in "early media" state only for 60 seconds, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param extraHeaders Optional custom parameters (SIP headers) that should be passed with the request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   * @param scheme Internal information about codecs from the [AppEvents.CallAlerting] event. Optional
   * @param maxVideoBitrate Set the maximum possible video bitrate for the customer device in kbps. Optional
   * @param audioLevelExtension
   * @param conferenceCall Whether the call is coming from a conference. Optional. The default value is false
   */
  startEarlyMedia(
    extraHeaders?: { [header: string]: string },
    scheme?: string,
    maxVideoBitrate?: number,
    audioLevelExtension?: boolean,
    conferenceCall?: boolean
  ): void;

  /**
   * Starts to play an audio file to the answered call. You can stop playback manually via the [Call.stopPlayback] method. Media streams can later be attached via the [Call.sendMediaTo] method etc. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new inbound stream always replaces the previous one.
   * @param url HTTP/HTTPS url to the audio file. The file is cached after the first playing. Supported formats are: mp3, ogg & flac (mp3, speex, vorbis and flac codecs respectively). Maximum file size is 10 Mb.
   * @param startPlaybackOptions Playback parameters: loop, progressive playback, etc.
   */
  startPlayback(url: string, startPlaybackOptions: VoxEngine.StartPlaybackOptions): void;

  /**
   * Say some text to the [CallEvents.Connected] call.
   * If text length exceeds 1500 characters the
   * [PlayerEvents.PlaybackFinished] event is triggered with error description.
   * IMPORTANT: each call object can send media to any number
   * of other calls (media units), but can receive only one audio
   * stream. A new inbound stream always replaces the previous one.
   * @param text Message that is played to the call. To put an accent to the specified syllable, use the <say-as stress='1'></say-as> tag.
   * @param sayOptions Parameters for TTS: language, progressive playback, volume, rate, etc.
   * @warning This method internally operates with the [Player] class and its events. Use the [VoxEngine.createTTSPlayer] to get more flexibility
   */
  say(text: string, sayOptions: VoxEngine.SayOptions): void;

  /**
   * Starts recording the inbound and outbound audio for this call.
   * This method triggers the [CallEvents.RecordStarted] event.
   * The default quality is 8kHz / 32kbps; the format is __mp3__.
   * @param params Recorder parameters
   */
  record(params: VoxEngine.CallRecordParameters): void;

  /**
   * Stops audio playback started before via the [Call.startPlayback] method.
   */
  stopPlayback(): void;

  /**
   * Provides country-specific dial tones. The method sends a command to the Voximplant cloud to start playing dial tones in the call. The dial tones fully depend on the Voximplant cloud. Note that in order to work properly in a call that is not connected yet, you need to call the [Call.startEarlyMedia] method before using this function. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new inbound stream always replaces the previous one.
   * @param country 2-letter country code. Currently supported values are US, RU.
   */
  playProgressTone(country: string): void;

  /**
   * Sends a text message to the call. See the similar methods in the Android SDKs.
   * @param text Message text. Maximum size is 8192 bytes according to the limits.
   */
  sendMessage(text: string): void;

  /**
   * Starts sending media (voice and video) from this call to media unit specified in targetMediaUnit. The target call has to be [CallEvents.Connected] earlier. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new inbound stream always replaces the previous one.
   * @param targetMediaUnit Media unit that receives media.
   * @param optional Custom parameters for WebSocket interaction only.
   */
  sendMediaTo(targetMediaUnit: VoxMediaUnit, optional?: SendMediaOptions): void;

  /**
   * Stops sending media (voice and video) from this call to media unit specified in targetMediaUnit.
   * @param targetMediaUnit Media unit that does not need to receive media from this call anymore.
   */
  stopMediaTo(targetMediaUnit: VoxMediaUnit): void;

  /**
   * Changes DTMF processing mode (in-band DTMF, RFC 2833 DTMF and DTMF over SIP INFO) telephony signals. If true, each received DTMF signal triggers the CallEvents.ToneReceived and removes from audio stream.
   * @param doHandle Whether to enable DTMF analysis. The default values is true
   * @param supportedDtmfTypes The DTMF type to process. The default value is ALL
   */
  handleTones(doHandle: boolean, supportedDtmfTypes?: VoxEngine.DTMFType): void;

  /**
   * Sends info (SIP INFO) message to the call
   * @param mimeType MIME type of the message
   * @param body Message content. Maximum size is 8192 bytes according to the limits
   * @param headers Optional headers to be passed with the message. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}.
   */
  sendInfo(mimeType: string, body: string, headers?: { [header: string]: string }): void;

  /**
   * Sends DTMF digits to the remote peer.
   * @param digits Any combination of 0-9, *, #, p (pause) symbols.
   */
  sendDigits(digits: string): void;

  /**
   * Whether to enable detection of microphone status in the call. If detection is enabled, the [CallEvents.MicStatusChange] event is triggered at each status' change.
   * @param handle Enable/disable microphone status analysis. The default value is false.
   */
  handleMicStatus(handle: boolean): void;

  /**
   * Whether to enable blind transfers. When enabled, the [CallEvents.BlindTransferRequested] event is triggered to request for the third call leg within an existing session and notify the transfer initiator of the result.
   * @param handle Enable/disable blind transfers.
   */
  handleBlindTransfer(handle: boolean): void;

  /**
   * Sends a notification of a successful call transfer with the "200 OK" message.
   */
  notifyBlindTransferSuccess(): void;

  /**
   * Sends a notification about a failed call transfer with an error code and reason.
   * @param code Error code.
   * @param reason Reason why the blind transfer is failed.
   */
  notifyBlindTransferFailed(code: number, reason: string): void;
}

/**
 * Represents a call list to interact with Voximplant's call list processing functionality.
 */
declare namespace CallList {}

declare namespace CallList {
  /**
   * Report error to the CallList module
   * @param error Error string or JSON
   * @param callback Callback to execute when a result is processed
   */
  function reportError(
    error: string | Object,
    callback?: (result: Net.HttpRequestResult) => void
  ): void;
}

declare namespace CallList {
  /**
   * Report progress to the CallList module
   * @param progress Progress description string or JSON
   * @param callback Callback to execute when a result is processed
   */
  function reportProgress(
    progress: string | Object,
    callback?: (result: Net.HttpRequestResult) => void
  ): void;
}

declare namespace CallList {
  /**
   * Report result to the CallList module
   * @param result Result description string or JSON
   * @param callback Callback to execute when a result is processed
   */
  function reportResult(
    result: string | Object,
    callback?: (result: Net.HttpRequestResult) => void
  ): void;
}

declare module CCAI {
  /**
   * This class represents a CCAI Agent instance. Add the following line to your scenario code to use the class:
   * ```
   * require(Modules.AI);
   * ```
   */
  class Agent {
    constructor(agentId: string, region?: string);

    /**
     * Destroys a CCAI Agent instance.
     */
    destroy(): void;

    /**
     * Adds a handler for the specified [CCAI.Events.Agent] event. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called
     * @param event Event class (i.e., CCAI.Events.Agent.Started)
     * @param callback Callback function to execute
     */
    public addEventListener<T extends keyof CCAI.Events._AgentEvents>(
      event: CCAI.Events.Agent | T,
      callback: (ev: CCAI.Events._AgentEvents[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [CCAI.Events.Agent] event
     * @param event Event class (i.e., CCAI.Events.Agent.Started)
     * @param callback Callback function to execute. If not specified, all event listeners are removed
     */
    public removeEventListener<T extends keyof CCAI.Events._AgentEvents>(
      event: CCAI.Events.Agent | T,
      callback?: (ev: CCAI.Events._AgentEvents[T]) => any
    ): void;
  }
}

/**
 * Add the following line to your scenario code to use the ref folder:
 * ```
 * require(Modules.AI);
 * ```
 */
declare module CCAI {}

declare module CCAI {
  module Vendor {
    /**
     * Defines the services to connect to the inbound Dialogflow conversations.
     */
    interface ConversationProfile {
      /**
       * The unique identifier of this conversation profile. Format: projects/<Project ID>/conversationProfiles/<Conversation Profile ID>.
       */
      name: string;
      /**
       * Required. A human-readable name for this profile. Max length is 1024 bytes.
       */
      display_name: string;
    }
  }
}

declare module CCAI {
  /**
   * Conversation settings. Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface ConversationSettings {
    /**
     * CCAI agent to use in the Dialogflow conversation.
     */
    agent: Agent;
    /**
     * Service to connect to the inbound Dialogflow conversation.
     */
    profile: CCAI.Vendor.ConversationProfile;
  }
}

declare module CCAI {
  /**
   * This class represents a CCAI conversation instance. Add the following line to your scenario code to use the class:
   * ```
   * require(Modules.AI);
   * ```
   */
  class Conversation {
    constructor(settings: CCAI.ConversationSettings);

    /**
     * Adds a participant to the conversation.
     */
    addParticipant(settings: CCAI.ParticipantSettings): CCAI.Participant;

    /**
     * Removes a participant from the conversation.
     */
    removeParticipant(participant: CCAI.Participant): void;

    /**
     * Adds a handler for the specified [CCAI.Events.Conversation] event. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called
     * @param event Event class (i.e., CCAI.Events.Conversation.Created)
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    public addEventListener<T extends keyof CCAI.Events._ConversationEvents>(
      event: CCAI.Events.Conversation | T,
      callback: (ev: CCAI.Events._ConversationEvents[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [CCAI.Events.Conversation] event
     * @param event Event class (i.e., CCAI.Events.Conversation.Created)
     * @param callback Handler function. If not specified, all event listeners are removed
     */
    public removeEventListener<T extends keyof CCAI.Events._ConversationEvents>(
      event: CCAI.Events.Conversation | T,
      callback?: (ev: CCAI.Events._ConversationEvents[T]) => any
    ): void;
  }
}

declare module CCAI {
  module Vendor {
    /**
     * Events allow matching intents by event name instead of the natural language input. For instance, the <event: { name: "welcome_event", parameters: { name: "Sam" } }> input can trigger a personalized welcome response. The parameter `name` may be used by the agent in the response: `"Hello #welcome_event.name! What can I do for you today?"`.
     */
    interface EventInput {
      /**
       * Required. The unique identifier of the event.
       */
      name: string;
      /**
       * The collection of parameters associated with the event.
       * Depending on your protocol or client library language, this is a map, associative array, symbol table, dictionary, or JSON object composed of a collection of (MapKey, MapValue) pairs:
       * * MapKey type: string
       * * MapKey value: parameter name
       * * MapValue type:
       * * If parameter's entity type is a composite entity: map
       * * Else: string or number, depending on the parameter value type
       * * MapValue value:
       * * If parameter's entity type is a composite entity: map from composite entity property names to property values
       * * Else: parameter value
       */
      parameters: { [key: string]: any };
      /**
       * Required. The language of this query. See [Language Support](https://cloud.google.com/dialogflow/docs/reference/language) for a list of the currently supported language codes. Note that queries in the same session do not necessarily need to have the same language.
       */
      language_code: string;
    }
  }
}

declare module CCAI {
  module Events {
    /**
     * Events related to CCAI agents.
     * @event
     */
    enum Agent {
      /**
       * Triggers after the CCAI Agent instance is created.
       * @typedef _AgentStartedEvent
       */
      Started = 'AI.Events.CcaiAgentStarted',
      /**
       * Triggers after the CCAI Agent instance is destroyed.
       * @typedef _AgentStoppedEvent
       */
      Stopped = 'AI.Events.CcaiAgentStopped',
    }

    /**
     * @private
     */
    interface _AgentEvents {
      [Agent.Started]: _AgentStartedEvent;
      [Agent.Stopped]: _AgentStoppedEvent;
    }

    /**
     * @private
     */
    interface _AgentStartedEvent {}

    /**
     * @private
     */
    interface _AgentStoppedEvent {}
  }
}

declare module CCAI {
  module Events {
    /**
     * Events related to CCAI conversations.
     * @event
     */
    enum Conversation {
      /**
       * Triggers after the CCAI Conversation instance is created.
       * @typedef _ConversationCreatedEvent
       */
      Created = 'AI.Events.CcaiConversationCreated',
      /**
       * Triggers when a conversation profile is created in the specified project.
       * @typedef _ConversationProfileCreatedEvent
       */
      ProfileCreated = 'AI.Events.CcaiConversationProfileCreated',
      /**
       * Triggers when the conversation is completed.
       * @typedef _ConversationCompletedEvent
       */
      Completed = 'AI.Events.CcaiConversationCompleted',
      /**
       * Triggers when a CCAI Conversation instance causes an error.
       * @typedef _ConversationErrorEvent
       */
      Error = 'AI.Events.CcaiConversationError',
    }

    /**
     * @private
     */
    interface _ConversationEvents {
      [Conversation.Created]: _ConversationCreatedEvent;
      [Conversation.ProfileCreated]: _ConversationProfileCreatedEvent;
      [Conversation.Completed]: _ConversationCompletedEvent;
      [Conversation.Error]: _ConversationErrorEvent;
    }

    /**
     * @private
     */
    interface _ConversationCreatedEvent {}

    /**
     * @private
     */
    interface _ConversationProfileCreatedEvent {}

    /**
     * @private
     */
    interface _ConversationCompletedEvent {}

    /**
     * @private
     */
    interface _ConversationErrorEvent {}

    /**
     * @private
     */
    interface _ConversationErrorEvent {}
  }
}

declare module CCAI {
  /**
   * Add the following line to your scenario code to use the ref folder:
   * ```
   * require(Modules.AI);
   * ```
   */
  module Events {}
}

declare module CCAI {
  module Events {
    /**
     * Events related to CCAI participants.
     * @event
     */
    enum Participant {
      /**
       * Triggers after the CCAI Participant instance is created.
       * @typedef _ParticipantCreatedEvent
       */
      Created = 'AI.Events.CcaiParticipantCreated',
      /**
       * Triggers when a CCAI Participant instance returns an intent response.
       * @typedef _ParticipantResponseEvent
       */
      Response = 'AI.Events.CcaiParticipantResponse',
      /**
       * Triggers when playback of a single phrase has finished successfully or in case of a playback error.
       * @typedef _ParticipantPlaybackFinishedEvent
       */
      PlaybackFinished = 'AI.Events.CcaiParticipantPlaybackFinished',
      /**
       * Triggers when playback of a single phrase has started.
       * @typedef _ParticipantPlaybackStartedEvent
       */
      PlaybackStarted = 'AI.Events.CcaiParticipantPlaybackStarted',
      /**
       * Triggers when audio_segments from Google are ready to be played.
       * @typedef _ParticipantPlaybackReadyEvent
       */
      PlaybackReady = 'AI.Events.CcaiParticipantPlaybackReady',
      /**
       * Triggers when [Participant.addPlaybackMarker] is reached.
       * @typedef _ParticipantMarkerReachedEvent
       */
      MarkerReached = 'AI.Events.CcaiParticipantMarkerReached',
    }

    /**
     * @private
     */
    interface _ParticipantEvents {
      [Participant.Created]: _ParticipantCreatedEvent;
      [Participant.Response]: _ParticipantResponseEvent;
      [Participant.PlaybackFinished]: _ParticipantPlaybackFinishedEvent;
      [Participant.MarkerReached]: _ParticipantMarkerReachedEvent;
      [Participant.PlaybackReady]: _ParticipantPlaybackReadyEvent;
      [Participant.PlaybackStarted]: _ParticipantPlaybackStartedEvent;
    }

    /**
     * @private
     */
    interface _ParticipantCreatedEvent {}

    /**
     * @private
     */
    interface _ParticipantResponseEvent {}

    /**
     * @private
     */
    interface _ParticipantPlaybackFinishedEvent {}

    /**
     * @private
     */
    interface _ParticipantPlaybackStartedEvent {}

    /**
     * @private
     */
    interface _ParticipantPlaybackReadyEvent {}

    /**
     * @private
     */
    interface _ParticipantMarkerReachedEvent {}
  }
}

declare module CCAI {
  /**
   * Participant settings. Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface ParticipantSettings {
    /**
     * Current call object.
     */
    call: Call;
    /**
     * Settings for a new CCAI Dialogflow participant instance setup.
     */
    dialogflowSettings: any;
    /**
     * Options of a single side of the conversation.
     */
    options: CCAI.Vendor.Participant;
  }
}

declare module CCAI {
  /**
   * This class represents a CCAI participant instance. Add the following line to your scenario code to use the class:
   * ```
   * require(Modules.AI);
   * ```
   */
  class Participant {
    /**
     * Participant's ID.
     */
    id(): string;

    /**
     * Call object associated with the participant.
     */
    call(): Call;

    /**
     * Adds a message from a participant into the Dialogflow CCAI.​
     */
    analyzeContent(query: CCAI.Vendor.EventInput | CCAI.Vendor.TextInput): void;

    /**
     * Adds a Dialogflow speech synthesis playback marker. The Participant.MarkerReached event is triggered when the marker is reached.
     */
    addPlaybackMarker(offset: number, playbackId?: string): void;

    /**
     * Adds a handler for the specified [CCAI.Events.Participant] event. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called.
     * @param event Event class (i.e., CCAI.Events.Participant.Created)
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    public addEventListener<T extends keyof CCAI.Events._ParticipantEvents>(
      event: CCAI.Events.Participant | T,
      callback: (ev: CCAI.Events._ParticipantEvents[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [CCAI.Events.Participant] event
     * @param event Event class (i.e., CCAI.Events.Participant.Created)
     * @param callback Handler function. If not specified, all event listeners are removed
     */
    public removeEventListener<T extends keyof CCAI.Events._ParticipantEvents>(
      event: CCAI.Events.Participant | T,
      callback?: (ev: CCAI.Events._ParticipantEvents[T]) => any
    ): void;

    /**
     * Starts sending voice from a Dialogflow CCAI participant to the media unit specified in targetCall.
     */
    sendMediaTo(targetMediaUnit: VoxMediaUnit, optional?: SendMediaOptions): void;

    /**
     * Stops sending voice from a Dialogflow CCAI participant to the media unit specified in targetCall.
     */
    stopMediaTo(targetMediaUnit: VoxMediaUnit): void;
  }
}

declare module CCAI {
  module Vendor {
    /**
     * Represents a single side of the conversation.
     */
    interface Participant {
      /**
       * Optional. The unique identifier of this participant. Format: `projects/<Project ID>/conversations/<Conversation ID>/participants/<Participant ID>`.
       */
      name?: string;
      /**
       * Immutable. The role this participant plays in the conversation. This field can only be set during creation.
       */
      role: Role;
      /**
       * Optional. Label applied to streams representing this participant in SIPREC XML metadata and SDP. Use it to assign transcriptions from that media stream to this participant. This field can be updated.
       */
      sip_recording_media_label?: string;
      /**
       * Optional. Obfuscated user id that should be associated with the created participant.
       * You can specify a user id as follows:
       * * If you set this field in `CreateParticipantRequest` or `UpdateParticipantRequest`, Dialogflow adds the obfuscated user id with the participant.
       * * If you set this field in `AnalyzeContent` or `StreamingAnalyzeContent`, Dialogflow updates `Participant.obfuscated_external_user_id`.
       * Dialogflow returns an error if you try to add a user id for a non-`END_USER` participant.
       * Dialogflow uses this user id for billing and measurement purposes. For example, Dialogflow determines whether a user in one conversation returned in a later conversation.
       * Note:
       * * Never pass raw user ids to Dialogflow. Always obfuscate your user id first.
       * * Dialogflow only accepts a UTF-8 encoded string, e.g., a hex digest of a hash function like SHA-512.
       * * The length of the user id must be <= 256 characters.
       */
      obfuscated_external_user_id?: string;

      /**
       * Optional. Key-value filters on the metadata of documents returned by article suggestion. If specified, article suggestion only returns suggested documents that match all filters in their Document.metadata. Multiple values for a metadata key should be concatenated by a comma. For example, filters to match all documents that have 'US' or 'CA' in their market metadata values and 'agent' in their user metadata values are documents_metadata_filters { key: "market" value: "US,CA" } documents_metadata_filters { key: "user" value: "agent" }
       */
      documents_metadata_filters: { [key: string]: string };
    }
  }
}

declare module CCAI {
  module Vendor {
    /**
     * Enumeration of the roles a participant can play in a conversation.
     */
    enum Role {
      /**
       * Participant role not set.
       */
      ROLE_UNSPECIFIED,
      /**
       * Participant is an automated agent, such as a Dialogflow agent.
       */
      AUTOMATED_AGENT,
      /**
       * Participant is a customer that has called or chatted with Dialogflow services.
       */
      END_USER,
    }
  }
}

declare module CCAI {
  module Vendor {
    /**
     * Represents the natural language text to be processed.
     */
    interface TextInput {
      /**
       * Required. The UTF-8 encoded natural language text to be processed. Text length must not exceed 256 characters.
       */
      text: string;
      /**
       * Required. The language of this conversational query. See [Language Support](https://cloud.google.com/dialogflow/docs/reference/language) for a list of the currently supported language codes. Note that queries in the same session do not necessarily need to have the same language.
       */
      language_codes: string;
      /**
       * Whether to split the text into single sentence text entries at serving time. This provides a way for a user to input email content as text input.
       */
      enable_splitting_text: boolean;
    }
  }
}

declare module CCAI {
  /**
   * Add the following line to your scenario code to use the ref folder:
   * ```
   * require(Modules.AI);
   * ```
   */
  module Vendor {}
}

/**
 * Cancels a timed, repeating action which is previously established by a call to setInterval().
 * @param intervalID The identifier of the repeated action you want to cancel. This ID is returned by the corresponding call to setInterval().
 */
declare function clearInterval(intervalID: number): void;

/**
 * Cancels a timeout previously established by calling setTimeout().
 * @param timeoutID The identifier of the timeout you want to cancel. This ID is returned by the corresponding call to setTimeout().
 */
declare function clearTimeout(timeoutID: number): void;

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare enum ConferenceDirection {
  /**
   * provides only sending stream from endpoint to conference
   */
  SEND,
  /**
   * provides only receiving stream from conference to endpoint
   */
  RECEIVE,
  /**
   * provides only sending stream from endpoint to conference
   */
  BOTH,
}

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.Conference);
 * ```
 * @event
 */
declare enum ConferenceEvents {
  /**
   * Triggers in case of errors in the conference.
   * @typedef _ConferenceErrorEvent
   */
  ConferenceError = 'Conference.Error',
  /**
   * Triggers when the conference has started. I.e., the call of VoxEngine.createConference triggers the event.
   * @typedef _ConferenceEvent
   */
  Started = 'Conference.Started',
  /**
   * Triggers when the conference is stopped. I.e., the call of Conference.stop triggers the event.
   * @typedef _ConferenceStoppedEvent
   */
  Stopped = 'Conference.Stopped',
  /**
   * Triggers when the endpoint is added.
   * @typedef _ConferenceEndpointEvent
   */
  EndpointAdded = 'Conference.EndpointAdded',
  /**
   * Triggers when the endpoint is updated.
   * @typedef _ConferenceEndpointEvent
   */
  EndpointUpdated = 'Conference.EndpointUpdated',
  /**
   * Triggers when the endpoint is removed.
   * @typedef _ConferenceEndpointEvent
   */
  EndpointRemoved = 'Conference.EndpointRemoved',
}

/**
 * @private
 */
declare interface _ConferenceEvents {
  [ConferenceEvents.ConferenceError]: _ConferenceErrorEvent;
  [ConferenceEvents.Started]: _ConferenceEvent;
  [ConferenceEvents.Stopped]: _ConferenceStoppedEvent;
  [ConferenceEvents.EndpointAdded]: _ConferenceEndpointAddedEvent;
  [ConferenceEvents.EndpointUpdated]: _ConferenceEndpointUpdatedEvent;
  [ConferenceEvents.EndpointRemoved]: _ConferenceEndpointRemovedEvent;
}

/**
 * @private
 */
declare interface _ConferenceEvent {
  /**
   * Conference that triggered the event
   */
  conference: Conference;
}

/**
 * @private
 */
declare interface _ConferenceEndpointEvent extends _ConferenceEvent {
  /**
   * Possible values are MIX | FORWARD. MIX mode combines all streams in one, FORWARD mode sends only one stream.
   */
  mode: 'MIX' | 'FORWARD';
  /**
   * Possible values are SEND | RECEIVE | BOTH. SEND provides only sending stream from endpoint to conference; RECEIVE provides only receiving stream from conference to endpoint; BOTH allows both sending and receiving.
   */
  direction: 'SEND' | 'RECEIVE' | 'BOTH';
  /**
   * The unique ID of the endpoint.
   */
  endpointId: string;
  /**
   * The endpoint object.
   */
  endpoint: Endpoint;
}

/**
 * @private
 */
declare interface _ConferenceEndpointAddedEvent extends _ConferenceEndpointEvent {}

/**
 * @private
 */
declare interface _ConferenceEndpointUpdatedEvent extends _ConferenceEndpointEvent {}

/**
 * @private
 */
declare interface _ConferenceEndpointRemovedEvent extends _ConferenceEndpointEvent {}

/**
 * @private
 */
declare interface _ConferenceStoppedEvent extends _ConferenceEvent {
  /**
   * Conference cost
   */
  cost: string;
  /**
   * Conference duration
   */
  duration: string;
}

/**
 * @private
 */
declare interface _ConferenceErrorEvent extends _ConferenceEvent {
  /**
   * Error description
   */
  error: string;
  /**
   * Error code
   */
  code: number;
  /**
   * The id of the endpoint that caused the error
   */
  endpointId?: string;
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare enum ConferenceMode {
  /**
   * Combine all streams simultaneously
   */
  MIX,
  /**
   * Send only one stream
   */
  FORWARD,
}

/**
 * Represents a conference recorder.
 *
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare class ConferenceRecorder extends Recorder {
  /**
   * Conference object to record.
   */
  setConference(conference: Conference): void;

  /**
   * Sets an endpoint's priority.
   */
  setPriority(priority: Endpoint[]): Promise<void>;

  /**
   * Gets an endpoint's priority.
   */
  getPriority(): Endpoint[];

  /**
   * Updates the current video recorder options.
   */
  update(videoOpt: VoxEngine.UpdateVideoOpt): void;
}

/**
 * Represents audio or video conference.
 *
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare class Conference {
  /**
   * Adds a handler for the specified [ConferenceEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [ConferenceEvents.Started])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _ConferenceEvents>(
    event: ConferenceEvents | T,
    callback: (ev: _ConferenceEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [ConferenceEvents] event
   * @param event Event class (i.e., [ConferenceEvents.Started])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  removeEventListener<T extends keyof _ConferenceEvents>(
    event: ConferenceEvents | T,
    callback?: (ev: _ConferenceEvents[T]) => any
  ): void;


  /**
   * Stops the conference. Triggers the ConferenceEvents.Stopped event.
   */
  stop(): void;

  /**
   * Gets the endpoint list for current conference.
   */
  getList(): Endpoint[];

  /**
   * Gets the endpoint by the id.
   * @param id endpoint's id
   */
  get(id: string): Endpoint;

  /**
   * Creates a new endpoint and adds it to the specified conference. Important! You can only use this function for a conference with the “video conference” option checked in the routing rule.
   * Otherwise, you receive the ConferenceEvents.ConferenceError event with code 102. The maximum number of endpoints is 100.
   * @param options
   */
  add(options: EndpointOptions): Endpoint;

  /**
   * Starts sending media (voice and video) from this conference to media unit specified in targetCall.
   * @param mediaUnit media unit that receives media
   * @param optional custom parameters for WebSocket interaction only
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, optional?: SendMediaOptions): void;

  /**
   * Stops sending media (voice and video) from this conference to media unit specified in targetMediaUnit.
   * @param mediaUnit media unit that does not need to receive media from this conference anymore.
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;
}

declare module Crypto {}

declare module Crypto {
  /**
   * Calculates HMAC-SHA256 hash of the specified data.
   * @param key_string Key for calculation purposes
   * @param data_string String to calculate hash of
   */
  function hmac_sha256(key_string: string, data_string: string): string;
}

declare module Crypto {
  /**
   * Calculates MD5 hash. Can be used with HTTP requests that require hash.
   * @param data String to calculate hash of
   */
  function md5(data: string | string[]): string;
}

declare module Crypto {
  /**
   * Calculates SHA1 hash. Can be used with HTTP requests that require hash.
   * @param data String to calculate hash of
   */
  function sha1(data: string): string;
}

declare module Crypto {
  /**
   * Calculates SHA256 hash of the specified data.
   * @param data String to calculate hash of
   */
  function sha256(data: string): string;
}

/**
 * See https://dialogflow.com/docs/reference/language
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.AI);
 * ```
 */
declare enum DialogflowLanguage {
  /**
   * Brazilian portuguese. Supported features: Recognition, Text-to-Speech.
   */
  PORTUGUESE_BR = 'pt-BR',
  /**
   * Chinese Cantonese. Supported features: Recognition.
   */
  CHINESE_HK = 'zh-HK',
  /**
   * Chinese Simplified. Supported features: Recognition, Sentiment Analysis.
   */
  CHINESE_CN = 'zh-CN',
  /**
   * Chinese Traditional. Supported features: Recognition, Sentiment Analysis.
   */
  CHINESE_TW = 'zh-TW',
  /**
   * Danish. Supported features: Recognition.
   */
  DANISH = 'da',
  /**
   * Dutch. Supported features: Recognition, Text-to-Speech.
   */
  DUTCH = 'nl',
  /**
   * US English. Supported features: Recognition, Text-to-Speech, Telephony, Knowledge Connectors, Sentiment Analysis.
   */
  ENGLISH = 'en',
  /**
   * Australian English. Supported features: Recognition, Text-to-Speech, Knowledge Connectors.
   */
  ENGLISH_AU = 'en-AU',
  /**
   * Canadian English. Supported features: Recognition, Text-to-Speech, Knowledge Connectors.
   */
  ENGLISH_CA = 'en-CA',
  /**
   * British English. Supported features: Recognition, Text-to-Speech, Knowledge Connectors.
   */
  ENGLISH_GB = 'en-GB',
  /**
   * Indian English. Supported features: Recognition, Text-to-Speech, Knowledge Connectors.
   */
  ENGLISH_IN = 'en-IN',
  /**
   * US English (equivalent to ENGLISH). Supported features: Recognition, Text-to-Speech, Telephony, Knowledge Connectors, Sentiment Analysis.
   */
  ENGLISH_US = 'en-US',
  /**
   * French. Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  FRENCH = 'fr',
  /**
   * Canadian French. Supported features: Recognition, Text-to-Speech.
   */
  FRENCH_CA = 'fr-CA',
  /**
   * France (equivalent to FRENCH). Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  FRENCH_FR = 'fr-FR',
  /**
   * German. Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  GERMAN = 'de',
  /**
   * Hindi. Supported features: Recognition.
   */
  HINDI = 'hi',
  /**
   * Indonesian. Supported features: Recognition.
   */
  INDONESIAN = 'id',
  /**
   * Italian. Supported features: Recognition, Sentiment Analysis.
   */
  ITALIAN = 'it',
  /**
   * Japanese. Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  JAPANESE = 'ja',
  /**
   * Korean. Supported features: Recognition, Sentiment Analysis.
   */
  KOREAN = 'ko',
  /**
   * Norwegian. Supported features: Recognition.
   */
  NORWEGIAN = 'no',
  /**
   * Portuguese. Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  PORTUGUES = 'pt',
  /**
   * Brazilian Portuguese. Supported features: Recognition, Text-to-Speech.
   */
  PORTUGUES_BR = 'pt-BR',
  /**
   * Russian. Supported features: Recognition.
   */
  RUSSIAN = 'ru',
  /**
   * Spanish. Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  SPANISH = 'es',
  /**
   * Latin American Spanish Supported features: Recognition.
   */
  SPANISH_419 = 'es-419',
  /**
   * Spanish (equivalent to SPANISH). Supported features: Recognition, Text-to-Speech, Sentiment Analysis.
   */
  SPANISH_ES = 'es-ES',
  /**
   * Swedish. Supported features: Recognition.
   */
  SWEDISH = 'sv',
  /**
   * Thai. Supported features: Recognition.
   */
  THAI = 'th',
  /**
   * Ukranian. Supported features: Recognition.
   */
  UKRANIAN = 'uk',
  /**
   * Polish. Supported features: Recognition, Text-to-Speech.
   */
  POLISH = 'pl',
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.AI);
 * ```
 */
declare enum DialogflowModelVariant {
  /**
   * No model variant specified. In this case Dialogflow defaults to USE_BEST_AVAILABLE.
   * @const
   */
  SPEECH_MODEL_VARIANT_UNSPECIFIED = 'SPEECH_MODEL_VARIANT_UNSPECIFIED',
  /**
   * Use the best available variant of the Speech model that the caller is eligible for.
   * Please see the Dialogflow docs for how to make your project eligible for enhanced models.
   * @const
   */
  USE_BEST_AVAILABLE = 'USE_BEST_AVAILABLE',
  /**
   * Use standard model variant even if an enhanced model is available. See the Cloud Speech documentation for details about enhanced models.
   * @const
   */
  USE_STANDARD = 'USE_STANDARD',
  /**
   * Use an enhanced model variant:
   *  - If an enhanced variant does not exist for the given model and request language, Dialogflow falls back to the standard variant.
   *  The Cloud Speech documentation describes which models have enhanced variants.
   *  - If the API caller is not eligible for enhanced models, Dialogflow returns an error. Please see the Dialogflow docs for how to make your project eligible.
   * @const
   */
  USE_ENHANCED = 'USE_ENHANCED',
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.AI);
 * ```
 */
declare enum DialogflowModel {
  /**
   * Use this model for transcribing audio in video clips or ones that includes multiple speakers. For best results, provide audio recorded at 16,000Hz or greater sampling rate.
   * Note: This is a premium model that costs more than the standard rate.
   */
  VIDEO = 'video',
  /**
   * Use this model for transcribing audio from a phone call. Typically, phone audio is recorded at 8,000Hz sampling rate.
   * Note: The enhanced phone model is a premium model that costs more than the standard rate.
   */
  PHONE_CALL = 'phone_call',
  /**
   * Use this model for transcribing shorter audio clips. Some examples include voice commands or voice search.
   */
  COMMAND_AND_SEARCH = 'command_and_search',
  /**
   * Use this model if your audio does not fit one of the previously described models. For example, you can use this for long-form audio recordings that feature a single speaker only. Ideally, the audio is high-fidelity, recorded at 16,000Hz or greater sampling rate.
   */
  DEFAULT = 'default',
}

/**
 * Endpoint options.
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare interface EndpointOptions {
  /**
   * Call to be connected to the conference.
   */
  call: Call;
  /**
   * Possible values are MIX | FORWARD. MIX mode combines all streams in one, FORWARD mode sends only one stream.
   */
  mode: 'MIX' | 'FORWARD';
  /**
   * Possible values are SEND | RECEIVE | BOTH. SEND provides only sending stream from endpoint to conference; RECEIVE provides only receiving stream from conference to endpoint; BOTH allows both sending and receiving.
   */
  direction: 'SEND' | 'RECEIVE' | 'BOTH';
  /**
   * Required. Internal information about codecs.
   */
  scheme: any;
  /**
   * Human-readable endpoint's name.
   */
  displayName: string;
  /**
   * Endpoints and their streams (audio and/or video) to receive. These settings apply to the target endpoint right after adding it to a conference.
   * @beta
   */
  receiveParameters?: ReceiveParameters;
  /**
   * Maximum endpoint's video bitrate in kbps.
   */
  maxVideoBitrate: number;
}

/**
 * Represents any remote media unit in a session. An endpoint can be represented as ASR, Recorder, Player or another Call.
 *
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare class Endpoint {
  /**
   * Returns the endpoint's id.
   */
  id(): string;

  /**
   * Returns the endpoint's direction. Possible values are SEND | RECEIVE | BOTH. SEND provides only sending stream from endpoint to conference; RECEIVE provides only receiving stream from conference to endpoint; BOTH allows both sending and receiving.
   */
  getDirection(): 'SEND' | 'RECEIVE' | 'BOTH';

  /**
   * Returns the endpoint's mode. Possible values are MIX | FORWARD. MIX mode combines all streams in one, FORWARD mode sends only one stream.
   */
  getMode(): 'MIX' | 'FORWARD';

  /**
   * Sets the display name for the specified endpoint. When the display name is set, all SDK clients receive EndpointEvents.InfoUpdated event.
   * @param displayName
   */
  setDisplayName(displayName: string): void;

  /**
   * Enables/disables receiving media streams from other conference participants.
   * @param params
   * @beta
   */
  manageEndpoint(params: ReceiveParameters): Promise<void>;

  /**
   * Returns the endpoint's Call object if the endpoint is not a player or recorder instance.
   */
  getCall(): Call;
}

/**
 * Creates an array of numbers from parsing a hex string
 * @param data Hex string like "cafec0de"
 */
declare function hex2bytes(data: string): number[];

/**
 * Global IVR control module.
 * Add the following line to your scenario code to use the ref folder:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare module IVR {}

declare module IVR {
  /**
   * Resets the IVR; i.e., the method clears the list of existed [IVRState] objects. Use it to stop the entire IVR logic (e.g. near the call's ending).
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.IVR);
   * ```
   */
  function reset(): void;
}

/**
 * IVR menu prompt settings. Note that it is possible to specify playing parameter or a pair of the say and lang parameters.
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare interface IVRPrompt {
  /**
   * Voice message to say. Use it together with the lang parameter. SSML is supported; to use it, specify [ttsOptions](/docs/references/voxengine/voxengine/ttsoptions) before creating an IVRState instance:<br><code>IVR.ttsOptions = { "pitch": "low", "rate": "slow", "volume": "loud" }</code>
   */
  say: string;
  /**
   * TTS language for pronouncing a value of the <b>say</b> parameter. Lists of all supported languages: [VoiceList.Amazon], [VoiceList.Google], [VoiceList.IBM], [VoiceList.Microsoft], [VoiceList.Tinkoff], [VoiceList.Yandex], and [VoiceList.Default].
   */
  lang: string;
  /**
   * Voice message url to play. Supported formats are <b>mp3</b> and <b>ogg</b>.
   */
  play: string;
}

/**
 * IVR menu state settings
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare interface IVRSettings {
  /**
   * Prompt settings object
   */
  prompt: IVRPrompt;
  /**
   * Menu type. Possible values: select, inputfixed, inputunknown, noinput
   */
  type: string;
  /**
   * For inputunknown states - whether input is complete or not (input is passed as string)
   */
  inputValidator: (input: string) => boolean;
  /**
   * For inputfixed - length of desired input
   */
  inputLength: number;
  /**
   * Timeout in milliseconds for user input. The default value is 5000 ms
   */
  timeout: number;
  /**
   * For select type, map of IVR states to go to according to user input. If there is no next state for specific input, onInutComplete is invoked
   */
  nextStates: { [name: string]: IVRState };
  /**
   * When this digit is entered in inputunknown mode, input is considered to be complete
   */
  terminateOn: string;
  /**
   * Next state to go - for noinput state type
   */
  nextState: IVRState | null;
}

/**
 * Represents an IVR menu state.
 *
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare class IVRState {
  /**
   * This property is set when IVR leaves the specific state and holds user input
   */
  input: string;
  /**
   * IVR state settings object
   */
  settings: IVRSettings;

  /**
   * @param name State name
   * @param settings IVR menu state settings
   * @param onInputComplete Function to call after a user correctly provides input. User input should be passed as an argument
   * @param onInputTimeout Function to call in case of input timeout. User input should be passed as an argument
   */
  constructor(
    name: string,
    settings: IVRSettings,
    onInputComplete: (input: string) => void,
    onInputTimeout: (input: string) => void
  );

  /**
   * Starts the IVR from the current state for the specified call
   * @param call Call that IVR works with
   */
  enter(call: Call): void;
}

/**
 * Count the number of deletions, insertions, or substitutions required to transform str1 into str2. The number shows a measure of the similarity between two strings. It is also known as edit distance.
 * Add the following line to your scenario code to use the function:
 * ```
 * require(Modules.AI);
 * ```
 * @param str1 First string
 * @param str2 Second string
 */
declare function levenshtein_distance(str1: string, str2: string): number;

declare namespace Logger {
  /**
   * Whether to disable DTMF logging
   * @param flag The default value is false
   */
  function hideTones(flag: boolean): void;
}

declare namespace Logger {}

declare namespace Logger {
  /**
   * Writes a specified message to the session logger. Logs are stored in the [call history](https://manage.voximplant.com/calls).
   * @param message Message to write. Maximum length is 15000 characters
   */
  function write(message: string): void;
}

declare namespace MeasurementProtocol {
  /**
   * Forces the current session to end with this hit. All other values are ignored.
   * @returns {MeasurementProtocol}
   */
  function endSession(): typeof MeasurementProtocol;
}

/**
 * Implementation of the Measurement Protocol v1.
 * [https://developers.google.com/analytics/devguides/collection/protocol/v1](https://developers.google.com/analytics/devguides/collection/protocol/v1)
 */
declare namespace MeasurementProtocol {}

declare namespace MeasurementProtocol {
  interface SendEventOptions {
    nonInteractionHit?: string;
    category: string;
    action: string;
    label?: string;
    value?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Send an event to the Universal Analytics
   * @param {SendEventOptions} options
   * @returns {MeasurementProtocol}
   */
  function sendEvent(options: SendEventOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SendExceptionOptions {
    nonInteractionHit?: string;
    description?: string;
    isFatal?: boolean;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Sends a record about exception
   * @param {SendExceptionOptions} options
   * @returns {MeasurementProtocol}
   */
  function sendException(options: SendExceptionOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SendItemOptions {
    nonInteractionHit?: string;
    transactionId: number;
    name: string;
    price: number;
    quantity: number;
    code?: string;
    category?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Sends an item to E-commerce
   * @param {SendItemOptions} options
   * @returns {MeasurementProtocol}
   */
  function sendItem(options: SendItemOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SendSocialOptions {
    nonInteractionHit?: string;
    network?: string;
    action?: string;
    trigger?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Sends a social interaction
   * @param {SendSocialOptions} options
   * @returns {MeasurementProtocol}
   */
  function sendSocial(options: SendSocialOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SendTimingOptions {
    nonInteractionHit?: string;
    category?: string;
    name?: string;
    time?: number;
    label?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Measures the user's timings
   * @param {SendTimingOptions} options
   * @returns {MeasurementProtocol}
   */
  function sendTiming(options: SendTimingOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SendTransactionOptions {
    nonInteractionHit?: string;
    id: number;
    affiliation?: string;
    revenue: number;
    shipping?: number;
    tax?: number;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Sends a transaction to E-commerce
   * @param {SendTransactionOptions} options
   * @returns {MeasurementProtocol}
   */
  function sendTransaction(options: SendTransactionOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SetApplicationInfoOptions {
    name: string;
    id?: string;
    version?: string;
    installerID?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Sets application name and version
   * @param {SetApplicationInfoOptions} options
   * @returns {MeasurementProtocol}
   */
  function setApplicationInfo(options: SetApplicationInfoOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface SetSessionByCallerIdOptions {
    callerId?: string;
    userID?: string;
    anonymizeIP?: string;
    IPOverride?: string;
  }
}

declare namespace MeasurementProtocol {
  function setSessionByCallerId(
    options: SetSessionByCallerIdOptions
  ): Promise<typeof MeasurementProtocol>;
}

declare namespace MeasurementProtocol {
  interface SetTrafficSourceOptions {
    documentReferrer?: string;
    campaignName?: string;
    campaignSource?: string;
    campaignMedium?: string;
    campaignKeyword?: string;
    campaignContent?: string;
    campaignID?: string;
    googleAdsID?: string;
    googleDisplayAdsID?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Sets traffic source values.
   * @param {SetTrafficSourceOptions} options
   * @returns {MeasurementProtocol}
   */
  function setTrafficSource(options: SetTrafficSourceOptions): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  /**
   * Setups the most required tracking parameters
   */
  function setup(
    trackingId: string,
    debug: boolean,
    dataSource: string
  ): typeof MeasurementProtocol;
}

declare namespace MeasurementProtocol {
  interface StartSessionOptions {
    clientID: string;
    userID?: string;
    anonymizeIP?: boolean;
    IPOverride?: string;
    geographicalOverride?: string;
  }
}

declare namespace MeasurementProtocol {
  /**
   * Forces a new session to start with this hit. All other values are ignored.
   * @param {StartSessionOptions} options
   * @returns {MeasurementProtocol}
   */
  function startSession(options: StartSessionOptions): typeof MeasurementProtocol;
}

declare enum Modules {
  ACD,
  AI,
  ApplicationStorage,
  ASR,
  Avatar,
  Conference,
  IVR,
  MeasurementProtocol,
  MediaStatistics,
  PushService,
  Recorder,
  SmartQueue,
  StreamingAgent,
  WebSocket,
}

declare module Net {
  /**
   * Performs an asynchronous HTTP request. TCP connect timeout is 6 seconds and total request timeout is 90 seconds. Learn more about the [limits](/docs/guides/voxengine/limits).
   * @param url HTTP url to query
   * @param options Advanced settings
   */
  function httpRequestAsync(url: string, options?: HttpRequestOptions): Promise<HttpRequestResult>;
}

declare module Net {
  /**
   * Advanced HTTP request options
   */
  interface HttpRequestOptions {
    /**
     * HTTP request type as a string: 'GET', 'POST' etc. The default value is 'GET'
     */
    method?: string;
    /**
     * Optional. Raw UTF-8 encoded data string or an array of bytes in any encoding generated by [str2bytes](/docs/references/voxengine/str2bytes) to send as the HTTP request body when 'method' is set to 'POST', 'PUT', or 'PATCH'
     */
    postData?: string | number[];
    /**
     * Optional request headers
     */
    headers?: string[];
    /**
     * Optional request parameters. They can be specified in the URL itself as well
     */
    params?: { [key: string]: string };
    /**
     * Whether Net.HttpRequestResult.data should contain a list of 1-byte numbers corresponding to HTTP response data. If set to false, Net.HttpRequestResult.data is undefined
     */
    rawOutput?: boolean;
    /**
     * If set, overrides default HTTP request timeout, in seconds, the default value is 90 seconds. Timeout can only be decreased
     */
    timeout?: number;
    /**
     * Whether to enable logging the POST request body. The default value is false
     */
    enableSystemLog?: boolean;
  }
}

declare module Net {
  /**
   * HTTP response
   */
  interface HttpRequestResult {
    /**
     * Response code. HTTP code (2xx-5xx) or one of our internal status codes
     * <table><tr><td>0</td><td><a href="//voximplant.com/docs/references/voxengine/">Voxengine limits</a> are violated (e.g. HTTP request count exceeded)</td></tr><tr><td>-1</td><td>Unknown error</td></tr><tr><td>-2</td><td>Malformed URL</td></tr><tr><td>-3</td><td>Host not found</td></tr><tr><td>-4</td><td>Connection error</td></tr><tr><td>-5</td><td>Too many redirects</td></tr><tr><td>-6</td><td>Network error</td></tr><tr><td>-7</td><td>Timeout</td></tr><tr><td>-8</td><td>Internal error</td></tr><tr><td>-9</td><td>Server response is larger than 2 MB</td></tr></table>
     */
    code: number;
    /**
     * HTTP header string returned by the remote server, without processing
     */
    raw_headers?: string;
    /**
     * List of dictionaries with key and value fields representing HTTP headers returned by the remote server
     */
    headers?: { key: string; value: string }[];
    /**
     * HTTP response body if Content-Type is not binary
     */
    text?: string;
    /**
     * If [HttpRequestOptions.rawOutput] is true, data contains a list of 1-byte numbers corresponding to HTTP response data. If [HttpRequestOptions.rawOutput] is false, data is undefined.
     */
    data?: number[];
    /**
     * In case of an error contains the error description
     */
    error?: string;
  }
}

declare module Net {
  /**
   * Performs a regular HTTP or HTTPS request. To perform an HTTPS request, insert "https://" at the URL's beginning. GET is the default request method. TCP connect timeout is 6 seconds and total request timeout is 90 seconds. Learn more about the [limits](/docs/guides/voxengine/limits).
   * @param url HTTP url to query
   * @param callback Function to be called on completion. The function receives a response object of type [HttpRequestResult] as a first argument
   * @param options Advanced settings
   */
  function httpRequest(
    url: string,
    callback: (result: HttpRequestResult) => void,
    options?: HttpRequestOptions
  ): void;
}

declare module Net {}

declare module Net {
  /**
   * Send an email via a specified email server
   * @param mailServerAddress SMTP server address
   * @param from From address of the email
   * @param to To address or list of addresses
   * @param title Message title
   * @param body Message body
   * @param options Advanced settings
   */
  function sendMailAsync(
    mailServerAddress: string,
    from: string,
    to: string | string[],
    title: string,
    body: string,
    options?: SendMailOptions
  ): Promise<SendMailResult>;
}

declare module Net {
  /**
   * Advanced options for sendMail method
   */
  interface SendMailOptions {
    /**
     * Alternative HTML body
     */
    html: string;
    /**
     * CC addresses
     */
    cc: string | string[];
    /**
     * BCC addresses
     */
    bcc: string | string[];
    /**
     * Mail server port
     */
    port: number;
    /**
     * Login for mail server
     */
    login: string;
    /**
     * Password for mail server
     */
    password: string;
  }
}

declare module Net {
  /**
   * Result of sending an email
   */
  interface SendMailResult {
    /**
     * SMTP server response code
     */
    code: number;
    /**
     * Optional. SMTP server error message
     */
    error?: string;
  }
}

declare module Net {
  /**
   * Send email via the specified email server
   * @param mailServerAddress SMTP server to send email
   * @param from From address of email
   * @param to To address or list of addresses
   * @param title Message title
   * @param body Message body
   * @param callback Function to be called on completion
   * @param options Advanced settings
   */
  function sendMail(
    mailServerAddress: string,
    from: string,
    to: string | string[],
    title: string,
    body: string,
    callback: (result: SendMailResult) => void,
    options?: SendMailOptions
  ): void;
}

/**
 * Which media streams to receive from the endpoint. Consists of optional video and audio keys.
 * 
 * For each key, specify the <b>["default"]</b> value to receive all media streams, specify the empty array <b>[]</b> value to receive no media streams, or specify the media stream IDs (for example, <b>["v1", "v10"]</b>) to receive specific media streams.
 */
interface ParticipantReceiveParameters {
  /**
   * Video streams to receive.
   */
  video?: Array<'default' | string>;
  /**
   * Audio streams to receive.
   */
  audio?: Array<'default' | string>;
}

declare module PhoneNumber {
  /**
   * Get the phone number info.
   * @param number Phone number in country specific format, or E.164 if starts with +
   * @param country 2-digit country code to get number format, if not specified, number is treated as E.164, e.g. "RU", "US"
   */
  function getInfo(number: string, country?: string): Info;
}

declare module PhoneNumber {
  interface Info {
    /**
     * Number type, one of: FIXED\_LINE, MOBILE, FIXED\_LINE\_OR\_MOBILE, TOLL\_FREE, PREMIUM\_RATE, SHARED\_COST, VOIP, PERSONAL\_NUMBER, PAGER, UAN, VOICEMAIL, UNKNOWN
     */
    numberType: string;
    /**
     * 2-letter country code of specified phone number (ISO 3166-1)
     */
    region: string;
    /**
     * The phone number's city, state and country. If the city (or state) is unavailable, only state and country (or just country) is shown
     */
    location: string;
    /**
     * Whether the number is possible in specified country (just by analyzing length infomation)
     */
    isPossibleNumber: boolean;
    /**
     * Whether the number is valid in specified country
     */
    isValidNumber: boolean;
    /**
     * Whether the number is valid in detected region
     */
    isValidNumberForRegion: boolean;
    /**
     * Number in international E.164 format, starting with +
     */
    number: string;
    /**
     * Optional error string. Possible values are: INVALID\_COUNTRY\_CODE, NOT\_A\_NUMBER, TOO\_SHORT\_AFTER\_IDD, TOO\_SHORT\_NSN, TOO\_LONG\_NSN
     */
    error?: string;
  }
}

declare module PhoneNumber {}

/**
 * @event
 */
declare enum PlayerEvents {
  /**
   * Triggers when playback has finished successfully or with an error
   * @typedef _PlayerPlaybackFinishedEvent
   */
  PlaybackFinished = 'Player.PlaybackFinished',

  /**
   * Triggers when [Player.addMarker] is reached
   * @typedef _PlaybackMarkerReachedEvent
   */
  PlaybackMarkerReached = 'Player.PlaybackMarkerReached',

  /**
   * Triggers as a result of the [Player.stop] method call.
   * @typedef _PlayerEvent
   */
  Stopped = 'Player.Stopped',

  /**
   * Triggers when playback is started. Note that if the [createURLPlayer] method is called with the **onPause** parameter set to true, the event is not triggered; it is triggered after the [Player.resume] method call.
   * @typedef _PlayerEvent
   */
  Started = 'Player.Started',

  /**
   * Triggers by the [createURLPlayer] and [createTTSPlayer] methods when<br>
   * 1) the audio file download to the Voximpant cache is finished;<br>
   * 2) the audio file is found in the cache (i.e., it is in the cache before).
   * @typedef _PlayerEvent
   */
  PlaybackReady = 'Player.PlaybackReady',

  /**
   * Triggers when an audio file is playing faster than it is being loaded.
   * @typedef _PlayerEvent
   */
  PlaybackBuffering = 'Player.Buffering',
}

/**
 * @private
 */
declare interface _PlayerEvents {
  [PlayerEvents.PlaybackFinished]: _PlayerPlaybackFinishedEvent;
  [PlayerEvents.PlaybackMarkerReached]: _PlaybackMarkerReachedEvent;
  [PlayerEvents.Stopped]: _PlayerStoppedEvent;
  [PlayerEvents.Started]: _PlayerStartedEvent;
  [PlayerEvents.PlaybackReady]: _PlayerPlaybackReadyEvent;
  [PlayerEvents.PlaybackBuffering]: _PlayerPlaybackBufferingEvent;
}

/**
 * @private
 */
declare interface _PlayerEvent {
  /**
   * Player that generated the event
   */
  player: Player;
}

/**
 * @private
 */
declare interface _PlayerStoppedEvent extends _PlayerEvent {}

/**
 * @private
 */
declare interface _PlayerPlaybackReadyEvent extends _PlayerEvent {}

/**
 * @private
 */
declare interface _PlayerPlaybackBufferingEvent extends _PlayerEvent {}

/**
 * @private
 */
declare interface _PlayerStartedEvent extends _PlayerEvent {
  /**
   * Playback duration
   */
  duration: number;
}

/**
 * @private
 */
declare interface _PlaybackMarkerReachedEvent extends _PlayerEvent {
  /**
   * The marker offset
   */
  offset: number;
}

/**
 * @private
 */
declare interface _PlayerPlaybackFinishedEvent extends _PlayerEvent {
  /**
   * Error message
   */
  error?: string;
}

/**
 * Represents an audio player.
 */
declare class Player {
  /**
   * Adds a handler for the specified [PlayerEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [PlayerEvents.PlaybackFinished])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _PlayerEvents>(
    event: PlayerEvents | T,
    callback: (ev: _PlayerEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [PlayerEvents] event
   * @param event Event class (i.e., [PlayerEvents.PlaybackFinished])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  removeEventListener<T extends keyof _PlayerEvents>(
    event: PlayerEvents | T,
    callback?: (ev: _PlayerEvents[T]) => any
  ): void;

  /**
   * Returns the player's id.
   */
  id(): string;

  /**
   * Pauses playback. To continue the playback use the [Player.resume] method.
   */
  pause(): void;

  /**
   * Resumes playback after the [Player.pause] method is called.
   */
  resume(): void;

  /**
   * Stops playback. The current player's instance is destroyed.
   */
  stop(): void;

  /**
   * Add a playback marker. The [PlayerEvents.PlaybackMarkerReached] event is triggered when the marker is reached.
   * @param offset Positive/negative offset (ms) from the start/end of media.
   */
  addMarker(offset: number): void;

  /**
   * Starts sending media (voice and video) from this call to the media unit specified in targetMediaUnit. Each call can send media to any number of other calls, but can receive from just one. So if targetCall is already receiving media from another call, that link would break.
   * @param mediaUnit Media unit that receives media.
   * @param optional Custom parameters for WebSocket interaction only.
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, optional?: SendMediaOptions): void;

  /**
   * Stop sending media (voice and video) from this call to media unit specified in targetMediaUnit.
   * @param mediaUnit Media unit that does not need to receive media from this conference anymore.
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;
}

/**
 * An object that specifies what media streams to receive from each endpoint.
 * 
 * The object can accept the following keys:
 * <ul>
 *     <li>A string value with the endpoint ID. Applies the setting only for the specified endpoint.</li>
 *     <li>The <b>all</b> keyword. Applies the setting for all the endpoints.</li>
 *     <li>The <b>new</b> keyword. Applies the setting for the new endpoints only.</li>
 * </ul>
 */
interface ReceiveParameters {
  /**
   * Substitute one of the available keys from the description.
   */
  [remoteParticipantId: string]: ParticipantReceiveParameters;
}

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.Recorder);
 * ```
 * @event
 */
declare enum RecorderEvents {
  /**
   * Triggers in case of errors during the recording process
   * @typedef _RecorderErrorEvent
   */
  RecorderError = 'Recorder.Error',
  /**
   * Triggers after the recording's start
   * @typedef _RecorderURLEvent
   */
  Started = 'Recorder.Started',
  /**
   * Triggers after the recording's stop
   * @typedef _RecorderStoppedEvent
   */
  Stopped = 'Recorder.Stopped',
}

/**
 * @private
 */
declare interface _RecorderEvent {
  /**
   * Recorder that generated the event
   */
  recorder: Recorder;
}

/**
 * @private
 */
declare interface _RecorderURLEvent extends _RecorderEvent {
  /**
   * The link to the record
   */
  url: string;
}

/**
 * @private
 */
declare interface _RecorderErrorEvent extends _RecorderEvent {
  /**
   * Error message
   */
  error: string;
}

/**
 * @private
 */
declare interface _RecorderStartedEvent extends _RecorderURLEvent {}

/**
 * @private
 */
declare interface _RecorderStoppedEvent extends _RecorderEvent {
  /**
   * Record cost (in the account's currency: USD, EUR or RUB)
   */
  cost: string;
  /**
   * Record duration (sec)
   */
  duration: number;
}

/**
 * @private
 */
declare interface _RecorderEvents {
  [RecorderEvents.RecorderError]: _RecorderErrorEvent;
  [RecorderEvents.Started]: _RecorderStartedEvent;
  [RecorderEvents.Stopped]: _RecorderStoppedEvent;
}

/**
 * Represents an audio and video recorder.
 *
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare class Recorder {
  /**
   * Adds a handler for the specified [RecorderEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [RecorderEvents.Stopped])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _RecorderEvents>(
    event: RecorderEvents | T,
    callback: (ev: _RecorderEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [RecorderEvents] event
   * @param event Event class (i.e., [RecorderEvents.Stopped])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  removeEventListener<T extends keyof _RecorderEvents>(
    event: RecorderEvents | T,
    callback?: (ev: _RecorderEvents[T]) => any
  ): void;

  /**
   * Returns the recorder's id.
   */
  id(): string;

  /**
   * Whether to mute whole record without detaching media sources from it
   * @param doMute Mute/unmute switch
   */
  mute(doMute: boolean): void;

  /**
   * Stops recording and triggers the RecorderEvents.Stopped event.
   */
  stop(): void;
}

declare function require(module: Modules): void;

declare interface SendMediaOptions {
  tag: string;
  customParameters?: any;
  encoding?: WebSocketAudioEncoding;
}

/**
 * Repeatedly calls a function or executes a code snippet, with a fixed time delay between each call.
 * @param callback A function to be executed every specified milliseconds. The function should not have any parameters, and no return value is expected.
 * @param timeout The time, in milliseconds (thousandths of a second), the timer specifies the delay between executions of the specified function or code. If this parameter is less than 100, a value of 100 is used. Note that the actual delay might be longer.
 */
declare function setInterval(callback: () => any, timeout?: number): number;

/**
 * Sets a timer which executes a function or specified piece of code once after the timer expires.
 * @param callback A function to be executed after the timer expires.
 * @param timeout The time, in milliseconds (thousandths of a second), the timer should wait before the specified function or code is executed. If this parameter is omitted, a value of 0 is used, meaning execute "immediately", or more accurately, as soon as possible. Note that in either case, the actual delay may be longer than intended
 */
declare function setTimeout(callback: () => any, timeout?: number): number;

/**
 * @event
 */
declare enum SmartQueueEvents {
  /**
   * The task is waiting for an agent.
   * @typedef _SmartQueueWaitingEvent
   */
  Waiting = 'SmartQueue.Waiting',
  /**
   * An agent connected to the task.
   * @typedef _SmartQueueOperatorReachedEvent
   */
  OperatorReached = 'SmartQueue.OperatorReached',
  /**
   * The task has been enqueued successfully.
   * @typedef _SmartQueueEnqueueSuccessEvent
   */
  EnqueueSuccess = 'SmartQueue.EnqueueSuccess',
  /**
   * SmartQueue starts the task distribution.
   * @typedef _SmartQueueTaskDistributedEvent
   */
  TaskDistributed = 'SmartQueue.DistributeTask',
  /**
   * The client disconnected.
   * @typedef _SmartQueueClientDisconnectedEvent
   */
  ClientDisconnected = 'SmartQueue.ClientDisconnected',
  /**
   * The task is cancelled.
   * @typedef _SmartQueueTaskCanceledEvent
   */
  TaskCanceled = 'SmartQueue.TaskCanceled',
  /**
   * An error occurred.
   * @typedef _SmartQueueErrorEvent
   */
  Error = 'SmartQueue.Error',
}

/**
 * @private
 */
declare interface _SmartQueueEvents {
  /**
   * Waiting for an agent to connect.
   */
  [SmartQueueEvents.Waiting]: _SmartQueueWaitingEvent;
  /**
   * An agent connected to the task.
   */
  [SmartQueueEvents.OperatorReached]: _SmartQueueOperatorReachedEvent;
  /**
   * The task has been enqueued successfully.
   */
  [SmartQueueEvents.EnqueueSuccess]: _SmartQueueEnqueueSuccessEvent;
  /**
   * SmartQueue starts task distribution.
   */
  [SmartQueueEvents.TaskDistributed]: _SmartQueueTaskDistributedEvent;
  /**
   * The task has ended because the client disconnected.
   */
  [SmartQueueEvents.ClientDisconnected]: _SmartQueueClientDisconnectedEvent;
  /**
   * The task is cancelled.
   */
  [SmartQueueEvents.TaskCanceled]: _SmartQueueTaskCanceledEvent;
  /**
   * An error occurred.
   */
  [SmartQueueEvents.Error]: _SmartQueueErrorEvent;
}

/**
 * @private
 */
declare interface _SmartQueueEvent {
  /**
   * A SmartQueue task
   */
  task: SmartQueueTask;
}

/**
 * @private
 */
declare interface _SmartQueueWaitingEvent extends _SmartQueueEvent {
  /**
   * Estimated time of agent's response in milliseconds
   */
  ewt: number;
  /**
   * The task's position in the queue
   */
  position: number;
  /**
   * The task's waiting code
   */
  code: TaskWaitingCode;
  /**
   * The task's waiting status
   */
  message: string;
}

/**
 * @private
 */
declare interface _SmartQueueOperatorReachedEvent extends _SmartQueueEvent {
  /**
   * The agent's Call object
   */
  agentCall: Call;
}

/**
 * @private
 */
declare interface _SmartQueueEnqueueSuccessEvent extends _SmartQueueEvent {}

/**
 * @private
 */
declare interface _SmartQueueTaskDistributedEvent extends _SmartQueueEvent {
  /**
   * The ID of the task's responsible agent
   */
  operatorId: number;
  /**
   * The name of the task's responsible agent
   */
  operatorName: string;
}

/**
 * @private
 */
declare interface _SmartQueueClientDisconnectedEvent extends _SmartQueueEvent {
  /**
   * Cancels the pending request and removes it from the queue
   */
  cancel(): void;
}

/**
 * @private
 */
declare interface _SmartQueueTaskCanceledEvent extends _SmartQueueEvent {
  /**
   * The SmartQueue termination status
   */
  status: TerminationStatus;
  /**
   * The SmartQueue task's error description
   */
  description: string;
}

/**
 * @private
 */
declare interface _SmartQueueErrorEvent extends _SmartQueueEvent {
  /**
   * The SmartQueue error code
   */
  type: TerminationStatus;
  /**
   * The SmartQueue task's error description
   */
  description: string;
}

/*
 * Smartqueue skill level is used to characterize an agent or a requirement for an task.
 */
declare interface SmartQueueSkill {
  /**
   * A readable skill name.
   */
  name: string;
  /**
   * The skill level from 1 to 5.
   */
  level: (1 | 2 | 3 | 4 | 5)[];
}

/*
 * Settings of a certain SmartQueue task.
 */
declare interface SmartQueueTaskSettings {
  /**
   * Current task's Call object.
   */
  call: Call;
  /**
   * A timeout in seconds for the task to be accepted by an agent.
   */
  timeout: number;
  /**
   * The task's priority. Accept values from 1 to 100. The default value is 50.
   */
  priority: number;
  /**
   * Required [skills](/docs/references/voxengine/smartqueueskill) for the task.
   */
  skills: SmartQueueSkill[];
  /**
   * Queue for the current task.
   */
  queue: SmartQueue;
  /**
   * A text string that can be used for passing custom data to your scenario.
   */
  customData: string;
}

/*
 * An task's status enumeration value.
 */
declare enum SmartQueueTaskStatus {
  /**
   * Smartqueue is distributing the task to a suitable agent.
   */
  DISTRIBUTING,
  /**
   * Smartqueue is connecting the task to an agent.
   */
  CONNECTING,
  /**
   * The agent connected to the task.
   */
  CONNECTED,
  /**
   * The agent has ended the task.
   */
  ENDED,
  /**
   * An error occurred.
   */
  FAILED,
}

/*
 * A SmartQueue task is for a certain agent, which can be a call or a chat.
 */
declare interface SmartQueueTask {
  /**
   * Current status of the task, whether it is distributing, connecting, connected, ended or failed.
   */
  readonly status: SmartQueueTaskStatus;
  /**
   * Reason of task's termination.
   */
  readonly terminationStatus: TerminationStatus | null;
  /**
   * The task's Call object.
   */
  readonly taskCall: Call;
  /**
   * The agent's Call object.
   */
  readonly operatorCall: Call | null;
  /**
   * SmartQueue task's settings, such as required skills, priority, queue and more.
   */
  readonly settings: SmartQueueTaskSettings;
  /**
   * A SmartQueue task's ID.
   */
  readonly id: string;

  /**
   * Ends the current task.
   */
  end(description: string): void;

  /**
   * Adds a handler for the specified [SmartQueueEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [SmartQueueEvents.OperatorReached])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _SmartQueueEvents>(
    event: SmartQueueEvents | T,
    callback: (ev: _SmartQueueEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [SmartQueueEvents] event
   * @param event Event class (i.e., [SmartQueueEvents.OperatorReached])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  removeEventListener<T extends keyof _SmartQueueEvents>(
    event: SmartQueueEvents | T,
    callback?: (ev: _SmartQueueEvents[T]) => any
  ): void;
}

/*
 * A SmartQueue object.
 */
declare interface SmartQueue {
  /**
   * Queue's identification number.
   */
  id: number;
  /**
   * Queue's name.
   */
  name: string;
}

/**
 * Result of the [get](/docs/references/voxengine/applicationstorage#get), [put](/docs/references/voxengine/applicationstorage#put), and [delete](/docs/references/voxengine/applicationstorage#delete) methods.
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.ApplicationStorage);
 * ```
 */
declare interface StorageKey {
  /**
   * Key name
   */
  key: string;
  /**
   * Key value
   */
  value: string;
  /**
   * Expiration date based on **ttl** specified via the [put](/docs/references/voxengine/applicationstorage#put) method
   */
  expireAt: number;
}

/**
 * Result of the [keys](/docs/references/voxengine/applicationstorage#keys) method.
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.ApplicationStorage);
 * ```
 */
declare interface StoragePage {
  /**
   * Array of keys
   */
  keys: string[];
}

/**
 * Creates an array of numbers from parsing string in specified codepage
 * @param data String to parse
 * @param encoding String encoding, the default value is "utf-8".
 */
declare function str2bytes(data: string, encoding: string): number[];

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.StreamingAgent);
 * ```
 * @event
 */
declare enum StreamingAgentEvents {
  /**
   * Triggers when a streaming object is connected to a streaming platform.
   * @typedef _StreamingAgentEvent
   * @type {string}
   */
  Connected = 'StreamingAgent.Connected',
  /**
   * Triggers when connection to a streaming platform is failed.
   * @typedef _StreamingAgentEvent
   * @type {string}
   */
  ConnectionFailed = 'StreamingAgent.ConnectionFailed',
  /**
   * Triggers if a streaming object cannot be created, e.g., due to incorrect **serverUrl**.
   * @typedef _StreamingAgentEvent
   * @type {string}
   */
  Error = 'StreamingAgent.Error',
  /**
   * Triggers when a streaming object is disconnected from a streaming platform.
   * @typedef _StreamingAgentEvent
   * @type {string}
   */
  Disconnected = 'StreamingAgent.Disconnected',
  /**
   * Triggers when a stream is successfully started.
   * @typedef _StreamingAgentStreamEvent
   * @type {string}
   */
  StreamStarted = 'StreamingAgent.Stream.Started',
  /**
   * Triggers when a streaming object caused an error, e.g., due to a codec mismatch.
   * @typedef _StreamingAgentStreamEvent
   * @type {string}
   */
  StreamError = 'StreamingAgent.Stream.Error',
  /**
   * Triggers when a stream is stopped.
   * @typedef _StreamingAgentStreamEvent
   * @type {string}
   */
  StreamStopped = 'StreamingAgent.Stream.Stopped',
  /**
   * Triggers when the audio stream is switched.
   * @typedef _StreamingAgentTrackSwitchedEvent
   */
  AudioSwitched = 'StreamingAgent.Stream.AudioSwitched',
  /**
   * Triggers when the video stream is switched.
   * @typedef _StreamingAgentTrackSwitchedEvent
   */
  VideoSwitched = 'StreamingAgent.Stream.VideoSwitched',
  /**
   * Triggers when there is audio data in the stream.
   * @typedef _StreamingAgentTrackStartedEvent
   * @type {string}
   */
  AudioStreamCreated = 'StreamingAgent.AudioStreamCreated',
  /**
   * Triggers when there is video data in the stream.
   * @typedef _StreamingAgentTrackStartedEvent
   * @type {string}
   */
  VideoStreamCreated = 'StreamingAgent.VideoStreamCreated',
}

/**
 * @private
 */
declare interface _StreamingAgentEvents {
  [StreamingAgentEvents.Connected]: _StreamingAgentConnectedEvent;
  [StreamingAgentEvents.ConnectionFailed]: _StreamingAgentConnectionFailedEvent;
  [StreamingAgentEvents.Error]: _StreamingAgentErrorEvent;
  [StreamingAgentEvents.Disconnected]: _StreamingAgentDisconnectedEvent;
  [StreamingAgentEvents.StreamStarted]: _StreamingAgentStreamStartedEvent;
  [StreamingAgentEvents.StreamStopped]: _StreamingAgentStreamStoppedEvent;
  [StreamingAgentEvents.StreamError]: _StreamingAgentStreamErrorEvent;
  [StreamingAgentEvents.AudioSwitched]: _StreamingAgentTrackSwitchedEvent;
  [StreamingAgentEvents.VideoSwitched]: _StreamingAgentTrackSwitchedEvent;
  [StreamingAgentEvents.AudioStreamCreated]: _StreamingAgentTrackStartedEvent;
  [StreamingAgentEvents.VideoStreamCreated]: _StreamingAgentTrackStartedEvent;
}

/**
 * @private
 */
declare interface _BaseStreamingAgentEvent {
  /**
   * Streaming object that triggered the event.
   */
  streamingAgent: StreamingAgent;
}

/**
 * @private
 */
declare interface _StreamingAgentReasonedEvent extends _BaseStreamingAgentEvent {
  /**
   * Reason why the stream is switched. Possible values are: "New stream", "Set stream".
   */
  reason: string;
}

/**
 * @private
 */
declare interface _StreamingAgentConnectedEvent extends _StreamingAgentReasonedEvent {}

/**
 * @private
 */
declare interface _StreamingAgentConnectionFailedEvent extends _StreamingAgentReasonedEvent {}

/**
 * @private
 */
declare interface _StreamingAgentErrorEvent extends _StreamingAgentReasonedEvent {}

/**
 * @private
 */
declare interface _StreamingAgentDisconnectedEvent extends _StreamingAgentReasonedEvent {}

/**
 * @private
 */
declare interface _StreamingAgentStreamEvent extends _StreamingAgentReasonedEvent {
  /**
   * Name of a streaming object that triggered the event.
   */
  streamName: string;
}

/**
 * @private
 */
declare interface _StreamingAgentStreamStartedEvent extends _StreamingAgentStreamEvent {}

/**
 * @private
 */
declare interface _StreamingAgentStreamStoppedEvent extends _StreamingAgentStreamEvent {}

/**
 * @private
 */
declare interface _StreamingAgentStreamErrorEvent extends _StreamingAgentStreamEvent {}

/**
 * @private
 */
declare interface _StreamingAgentTrackStartedEvent extends _BaseStreamingAgentEvent {
  /**
   * ID of an audio or video track. Equals to -1 if there is no track.
   */
  trackId: number;
}

/**
 * @private
 */
declare interface _StreamingAgentTrackSwitchedEvent extends _StreamingAgentReasonedEvent {
  /**
   * ID of an audio or video track. Equals to -1 if there is no track.
   */
  trackId: number;
}

/**
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.StreamingAgent);
 * ```
 */
declare interface StreamingAgentSettings {
  /**
   * Protocol for streaming purposes. Currently only RTMP is supported.
   */
  protocol: 'RTMP';
  /**
   * URL of a server which processes video streaming. Can be retrieved from a live-streaming CDN provider.
   */
  url: string;
  /**
   * URL of another streaming server to use if the server specified in **url** does not respond.
   */
  backupUrl?: string;
  /**
   * Unique stream name, use along with the **url**. Can be retrieved from a live-streaming CDN provider.
   */
  streamName?: string;
  /**
   * How often a keyframe in a stream is created (seconds). Default value is 2. Any value less than "2" yields "2".
   */
  keyframeInterval?: number;
  /**
   * Part of **streamName**, e.g, *live2*. The parameter is platform dependent, use it if it is required by the streaming platform.
   */
  applicationName?: string;
}

/**
 * Represents a streaming object to interact with streaming platforms.
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.StreamingAgent);
 * ```
 */
declare class StreamingAgent {
  /**
   * Adds a handler for the specified [StreamingAgentEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [StreamingAgentEvents.Connected])
   * @param callback Handler function that can take one parameter – the object with event information
   */
  addEventListener<T extends keyof _StreamingAgentEvents>(
    event: StreamingAgentEvents | T,
    callback: (ev: _StreamingAgentEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [StreamingAgentEvents] event
   * @param event Event class (i.e., [StreamingAgentEvents.Connected])
   * @param callback Handler function that can take one parameter – the object with event information
   */
  removeEventListener<T extends keyof _StreamingAgentEvents>(
    event: StreamingAgentEvents | T,
    callback?: (ev: _StreamingAgentEvents[T]) => any
  ): void;

  /**
   * Stops streaming. Triggers the StreamStopped event. Do not call any other streaming methods after a [StreamingAgent.stop] call.
   */
  stop(): void;

  /**
   * Gets the track ID of an active audio track or -1 if there is none.
   */
  activeAudioTrack(): number;

  /**
   * Gets the track ID of an active video track or -1 if there is none.
   */
  activeVideoTrack(): number;

  /**
   * Gets the list of all current audio tracks.
   */
  audioTracks(): number[];

  /**
   * Gets the list of all current video tracks.
   */
  videoTracks(): number[];

  /**
   * Sets a certain audio and/or video track as active.
   * If an active video track is set, it is not replaced by the new one unlike in the default mode.
   * Default mode: The active video track is the one that started sending data last. The active audio track is always the first one.
   * To return to the default mode, set the track IDs equal to -1.
   * @param tracks Audio and video track to set as active.
   */
  setActiveTrack(tracks: { audioTrack?: number; videoTrack?: number }): void;
}

declare enum TaskWaitingCode {
  /**
   * The task is not in a queue.
   */
  NONE = 500,
  /**
   * The task is queued successfully, the estimated response time is calculated.
   */
  SUCCESS = 200,
  /**
   * ETA for the task is not estimated.
   */
  CANNOT_BE_ESTIMATED = 501,
  /**
   * The task is not queued because of the queue overflow.
   */
  OVERFLOWED = 503,
}

declare enum TerminationStatus {
  /**
   * The task is completed in the scenario (TaskCanceledCode)
   */
  NORMAL = 1000,
  /**
   * The timeout for the task expired (TaskCanceledCode)
   */
  TIMEOUT_REACHED = 1001,
  /**
   * Media server does not answer (TaskCanceledCode)
   */
  MS_NOT_ANSWERED = 1002,
  /**
   * The customer has cancelled the task (EndTaskCode)
   */
  CLIENT_TERMINATE = 1100,
  /**
   * The customer has finished the task (EndOperatorActivityCode)
   */
  FINISHED_BY_CLIENT = 1201,
  /**
   * The agent has finished the task (EndOperatorActivityCode)
   */
  FINISHED_BY_OPERATOR = 1202,
  /**
   * The agent has missed or declined the task (EndOperatorActivityCode)
   */
  FAILED = 1203,
  /**
   * The task is cancelled in the scenario (EndOperatorActivityCode)
   */
  CANCELED = 1204,
  /**
   * The task is transferred (EndOperatorActivityCode)
   */
  TRANSFERRED = 1205,
  /**
   * An internal error occurred (ErrorCode, EndTaskCode, EndOperatorActivityCode)
   */
  INTERNAL_ERROR = 500,
}

/**
 * List of available values for the [CallRecordParameters.provider] parameter.
 *
 * Note that the Tinkoff VoiceKit and Yandex Speechkit supports only 'ASRLanguage.RUSSIAN_RU' language.
 * Add the following line to your scenario code to use the enum:
 *
 * ```
 * require(Modules.ASR);
 * ```
 */
declare enum TranscriptionProvider {
    /**
     * Google
     * @const
     */
    GOOGLE = 'google',
    /**
     * Yandex
     * @const
     */
    YANDEX = 'yandex',
    /**
     * Tinkoff
     * @const
     */
    TINKOFF = 'tsc',
}
/**
 * Generates unique identifier and returns it is string representation
 */
declare function uuidgen(): string;

declare namespace VoiceList {
  /**
   * List of Amazon Polly languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Amazon {
    /**
     * Amazon voice, English (US) female, Joanna.
     * @const
     */
    const en_US_Joanna: Voice;
    /**
     * Amazon voice, English (US) male, Joey.
     * @const
     */
    const en_US_Joey: Voice;
    /**
     * Amazon voice, English (UK) female, Amy.
     * @const
     */
    const en_GB_Amy: Voice;
    /**
     * Amazon voice, English (UK) male, Brian.
     * @const
     */
    const en_GB_Brian: Voice;
    /**
     * Amazon voice, English (Australia) female, Nicole.
     * @const
     */
    const en_AU_Nicole: Voice;
    /**
     * Amazon voice, English (Australia) male, Russell.
     * @const
     */
    const en_AU_Russell: Voice;
    /**
     * Amazon voice, Spanish (US) female, Penelope.
     * @const
     */
    const es_US_Penelope: Voice;
    /**
     * Amazon voice, Spanish (US) male, Miguel.
     * @const
     */
    const es_US_Miguel: Voice;
    /**
     * Amazon voice, Japanese (Japan) female, Mizuki.
     * @const
     */
    const ja_JP_Mizuki: Voice;
    /**
     * Amazon voice, Japanese (Japan) male, Takumi.
     * @const
     */
    const ja_JP_Takumi: Voice;
    /**
     * Amazon voice, Portuguese (Brazil) female, Vitoria.
     * @const
     */
    const pt_BR_Vitoria: Voice;
    /**
     * Amazon voice, Portuguese (Brazil) male, Ricardo.
     * @const
     */
    const pt_BR_Ricardo: Voice;
    /**
     * Amazon voice, Portuguese (Portugal) female, Ines.
     * @const
     */
    const pt_PT_Ines: Voice;
    /**
     * Amazon voice, Portuguese (Portugal) male, Cristiano.
     * @const
     */
    const pt_PT_Cristiano: Voice;
    /**
     * Amazon voice, Spanish (European) female, Conchita.
     * @const
     */
    const es_ES_Conchita: Voice;
    /**
     * Amazon voice, Spanish (Mexico) female, Mia.
     * @const
     */
    const es_MX_Mia: Voice;
    /**
     * Amazon voice, Spanish (European) male, Enrique.
     * @const
     */
    const es_ES_Enrique: Voice;
    /**
     * Amazon voice, Danish (Denmark) female, Naja.
     * @const
     */
    const da_DK_Naja: Voice;
    /**
     * Amazon voice, Danish (Denmark) male, Mads.
     * @const
     */
    const da_DK_Mads: Voice;
    /**
     * Amazon voice, French (France) female, Celine.
     * @const
     */
    const fr_FR_Celine: Voice;
    /**
     * Amazon voice, French (France) male, Mathieu.
     * @const
     */
    const fr_FR_Mathieu: Voice;
    /**
     * Amazon voice, Norwegian (Norway) female, Liv.
     * @const
     */
    const nb_NO_Liv: Voice;
    /**
     * Amazon voice, Dutch (Netherlands) female, Lotte.
     * @const
     */
    const nl_NL_Lotte: Voice;
    /**
     * Amazon voice, Dutch (Netherlands) male, Ruben.
     * @const
     */
    const nl_NL_Ruben: Voice;
    /**
     * Amazon voice, Polish (Poland) female, Maja.
     * @const
     */
    const pl_PL_Maja: Voice;
    /**
     * Amazon voice, Polish (Poland) male, Jan.
     * @const
     */
    const pl_PL_Jan: Voice;
    /**
     * Amazon voice, Italian (Italy) female, Carla.
     * @const
     */
    const it_IT_Carla: Voice;
    /**
     * Amazon voice, Italian (Italy) male, Giorgio.
     * @const
     */
    const it_IT_Giorgio: Voice;
    /**
     * Amazon voice, Turkish (Turkiye) female, Filiz.
     * @const
     */
    const tr_TR_Filiz: Voice;
    /**
     * Amazon voice, German (Germany) female, Marlene.
     * @const
     */
    const de_DE_Marlene: Voice;
    /**
     * Amazon voice, German (Germany) male, Hans.
     * @const
     */
    const de_DE_Hans: Voice;
    /**
     * Amazon voice, Swedish (Sweden) female, Astrid.
     * @const
     */
    const sv_SE_Astrid: Voice;
    /**
     * Amazon voice, French (Canada) female, Chantal.
     * @const
     */
    const fr_CA_Chantal: Voice;
    /**
     * Amazon voice, Arabic female, Zeina.
     * @const
     */
    const ar_SA_Zeina: Voice;
    /**
     * Amazon voice, English (India) female, Aditi.
     * @const
     */
    const en_IN_Aditi: Voice;
    /**
     * Amazon voice, English (Welsh) female, Gwyneth.
     * @const
     */
    const cy_GB_Gwyneth: Voice;
    /**
     * Amazon voice, English (Welsh) male, Geraint.
     * @const
     */
    const cy_GB_Geraint: Voice;
    /**
     * Amazon voice, Hindi (India) female, Aditi.
     * @const
     */
    const hi_IN_Aditi: Voice;
    /**
     * Amazon voice, Icelandic (Iceland) female, Dora.
     * @const
     */
    const is_IS_Dora: Voice;
    /**
     * Amazon voice, Icelandic (Iceland) male, Karl.
     * @const
     */
    const is_IS_Karl: Voice;
    /**
     * Amazon voice, Romanian (Romania) female, Carmen.
     * @const
     */
    const ro_RO_Carmen: Voice;
    /**
     * Amazon voice, Russian (Russia) male, Maxim.
     * @const
     */
    const ru_RU_Maxim: Voice;
    /**
     * Amazon voice, Russian (Russia) female, Tatyana.
     * @const
     */
    const ru_RU_Tatyana: Voice;
  }
}

declare namespace VoiceList {
  namespace Amazon {
    /**
     * Premium voices that sound more natural due to advanced synthesis technology.
     * @namespace
     */
    namespace Neural {
      /**
       * Neural Amazon voice, English (UK) female, Amy.
       * @const
       */
      const en_GB_Amy: Voice;

      /**
       * Neural Amazon voice, English (UK) female, Emma.
       * @const
       */
      const en_GB_Emma: Voice;

      /**
       * Neural Amazon voice, English (UK) male, Brian.
       * @const
       */
      const en_GB_Brian: Voice;

      /**
       * Neural Amazon voice, English (US) female, Ivy.
       * @const
       */
      const en_US_Ivy: Voice;

      /**
       * Neural Amazon voice, English (US) female, Joanna.
       * @const
       */
      const en_US_Joanna: Voice;

      /**
       * Neural Amazon voice, English (US) female, Kendra.
       * @const
       */
      const en_US_Kendra: Voice;

      /**
       * Neural Amazon voice, English (US) female, Kimberly.
       * @const
       */
      const en_US_Kimberly: Voice;

      /**
       * Neural Amazon voice, English (US) female, Salli.
       * @const
       */
      const en_US_Salli: Voice;

      /**
       * Neural Amazon voice, English (US) male, Joey.
       * @const
       */
      const en_US_Joey: Voice;

      /**
       * Neural Amazon voice, English (US) male, Justin.
       * @const
       */
      const en_US_Justin: Voice;

      /**
       * Neural Amazon voice, English (US) male, Matthew.
       * @const
       */
      const en_US_Matthew: Voice;
      /**
       * Neural Amazon voice, Portuguese (Brazil) female, Camila.
       * @const
       */
      const pt_BR_Camila: Voice;

      /**
       * Neural Amazon voice, Spanish (US) female, Lupe.
       * @const
       */
      const es_US_Lupe: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of freemium languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Default {
    /**
     * Freemium voice, Russian (Russia) female.
     * @const
     */
    const ru_RU_Female: Voice;
    /**
     * Freemium voice, Russian (Russia) male.
     * @const
     */
    const ru_RU_Male: Voice;
    /**
     * Freemium voice, English (US) female.
     * @const
     */
    const en_US_Female: Voice;
    /**
     * Freemium voice, English (US) male.
     * @const
     */
    const en_US_Male: Voice;
    /**
     * Freemium voice, Mandarin Chinese female.
     * @const
     */
    const cmn_CN_Female: Voice;
    /**
     * Freemium voice, Dutch (Netherlands) female.
     * @const
     */
    const nl_NL_Female: Voice;
    /**
     * Freemium voice, Dutch (Netherlands) male.
     * @const
     */
    const nl_NL_Male: Voice;
    /**
     * Freemium voice, Danish (Denmark) female.
     * @const
     */
    const da_DK_Female: Voice;
    /**
     * Freemium voice, Danish (Denmark) male.
     * @const
     */
    const da_DK_Male: Voice;
    /**
     * Freemium voice, Hindi (India) female.
     * @const
     */
    const hi_IN_Female: Voice;
    /**
     * Freemium voice, German (Germany) female.
     * @const
     */
    const de_DE_Female: Voice;
    /**
     * Freemium voice, German (Germany) male.
     * @const
     */
    const de_DE_Male: Voice;
    /**
     * Freemium voice, Italian (Italy) female.
     * @const
     */
    const it_IT_Female: Voice;
    /**
     * Freemium voice, Italian (Italy) male.
     * @const
     */
    const it_IT_Male: Voice;
    /**
     * Freemium voice, Japanese (Japan) female.
     * @const
     */
    const ja_JP_Female: Voice;
    /**
     * Freemium voice, Japanese (Japan) male.
     * @const
     */
    const ja_JP_Male: Voice;
    /**
     * Freemium voice, Korean (South Korea) female.
     * @const
     */
    const ko_KR_Female: Voice;
    /**
     * Freemium voice, Norwegian (Norway) female.
     * @const
     */
    const nb_NO_Female: Voice;
    /**
     * Freemium voice, Polish (Poland) female.
     * @const
     */
    const pl_PL_Female: Voice;
    /**
     * Freemium voice, Polish (Poland) male.
     * @const
     */
    const pl_PL_Male: Voice;
    /**
     * Freemium voice, Portuguese (Portugal) female.
     * @const
     */
    const pt_PT_Female: Voice;
    /**
     * Freemium voice, Portuguese (Portugal) male.
     * @const
     */
    const pt_PT_Male: Voice;
    /**
     * Freemium voice, Romanian (Romania) female.
     * @const
     */
    const ro_RO_Female: Voice;
    /**
     * Freemium voice, Spanish (Spain) female.
     * @const
     */
    const es_ES_Female: Voice;
    /**
     * Freemium voice, Spanish (Spain) male.
     * @const
     */
    const es_ES_Male: Voice;
    /**
     * Freemium voice, Swedish (Sweden) female.
     * @const
     */
    const sv_SE_Female: Voice;
    /**
     * Freemium voice, Turkish (Turkiye) female.
     * @const
     */
    const tr_TR_Female: Voice;
  }
}

declare namespace VoiceList {
  /**
   * List of Google Speech-to-Text languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Google {
    /**
     * Google voice, Afrikaans (South Africa) female.
     * @const
     */
    const af_ZA_Standard_A: Voice;
    /**
     * Google voice, Arabic female.
     * @const
     */
    const ar_XA_Standard_A: Voice;
    /**
     * Google voice, Arabic male.
     * @const
     */
    const ar_XA_Standard_B: Voice;
    /**
     * Google voice, Arabic male (second voice).
     * @const
     */
    const ar_XA_Standard_C: Voice;
    /**
     * Google voice, Arabic female (second voice).
     * @const
     */
    const ar_XA_Standard_D: Voice;
    /**
     * Google voice, Arabic female. Powered by WaveNet.
     * @const
     */
    const ar_XA_Wavenet_A: Voice;
    /**
     * Google voice, Arabic male. Powered by WaveNet.
     * @const
     */
    const ar_XA_Wavenet_B: Voice;
    /**
     * Google voice, Arabic male (second voice). Powered by WaveNet.
     * @const
     */
    const ar_XA_Wavenet_C: Voice;
    /**
     * Google voice, Arabic female (second voice). Powered by WaveNet.
     * @const
     */
    const ar_XA_Wavenet_D: Voice;
    /**
     * Google voice, Basque (Spain) female.
     * @const
     */
    const eu_ES_Standard_A: Voice;
    /**
     * Google voice, Bengali (India) female.
     * @const
     */
    const bn_IN_Standard_A: Voice;
    /**
     * Google voice, Bengali (India) male.
     * @const
     */
    const bn_IN_Standard_B: Voice;
    /**
     * Google voice, Bengali (India) female. Powered by WaveNet.
     * @const
     */
    const bn_IN_Wavenet_A: Voice;
    /**
     * Google voice, Bengali (India) male. Powered by WaveNet.
     * @const
     */
    const bn_IN_Wavenet_B: Voice;
    /**
     * Google voice, Bulgarian (Bulgaria) female.
     * @const
     */
    const bg_BG_Standard_A: Voice;
    /**
     * Google voice, Catalan (Spain) female.
     * @const
     */
    const ca_ES_Standard_A: Voice;
    /**
     * Google voice, Chinese (Hong Kong) female.
     * @const
     */
    const yue_HK_Standard_A: Voice;
    /**
     * Google voice, Chinese (Hong Kong) male.
     * @const
     */
    const yue_HK_Standard_B: Voice;
    /**
     * Google voice, Chinese (Hong Kong) female (second voice).
     * @const
     */
    const yue_HK_Standard_C: Voice;
    /**
     * Google voice, Chinese (Hong Kong) male (second voice).
     * @const
     */
    const yue_HK_Standard_D: Voice;
    /**
     * Google voice, Czech (Czech Republic) female.
     * @const
     */
    const cs_CZ_Standard_A: Voice;
    /**
     * Google voice, Czech (Czech Republic) female. Powered by WaveNet.
     * @const
     */
    const cs_CZ_Wavenet_A: Voice;
    /**
     * Google voice, Danish (Denmark) female.
     * @const
     */
    const da_DK_Standard_A: Voice;
    /**
     * Google voice, Danish (Denmark) male.
     * @const
     */
    const da_DK_Standard_C: Voice;
    /**
     * Google voice, Danish (Denmark) female (second voice).
     * @const
     */
    const da_DK_Standard_D: Voice;
    /**
     * Google voice, Danish (Denmark) female (third voice).
     * @const
     */
    const da_DK_Standard_E: Voice;
    /**
     * Google voice, Danish (Denmark) female. Powered by WaveNet.
     * @const
     */
    const da_DK_Wavenet_A: Voice;
    /**
     * Google voice, Danish (Denmark) male. Powered by WaveNet.
     * @const
     */
    const da_DK_Wavenet_C: Voice;
    /**
     * Google voice, Danish (Denmark) female (second voice). Powered by WaveNet.
     * @const
     */
    const da_DK_Wavenet_D: Voice;
    /**
     * Google voice, Danish (Denmark) female (third voice). Powered by WaveNet.
     * @const
     */
    const da_DK_Wavenet_E: Voice;
    /**
     * Google voice, Dutch (Belgium) female.
     * @const
     */
    const nl_BE_Standard_A: Voice;
    /**
     * Google voice, Dutch (Belgium) male.
     * @const
     */
    const nl_BE_Standard_B: Voice;
    /**
     * Google voice, Dutch (Belgium) female. Powered by WaveNet.
     * @const
     */
    const nl_BE_Wavenet_A: Voice;
    /**
     * Google voice, Dutch (Belgium) male. Powered by WaveNet.
     * @const
     */
    const nl_BE_Wavenet_B: Voice;
    /**
     * Google voice, Dutch (Netherlands) female.
     * @const
     */
    const nl_NL_Standard_A: Voice;
    /**
     * Google voice, Dutch (Netherlands) male.
     * @const
     */
    const nl_NL_Standard_B: Voice;
    /**
     * Google voice, Dutch (Netherlands) male (second voice).
     * @const
     */
    const nl_NL_Standard_C: Voice;
    /**
     * Google voice, Dutch (Netherlands) female (second voice).
     * @const
     */
    const nl_NL_Standard_D: Voice;
    /**
     * Google voice, Dutch (Netherlands) female (third voice).
     * @const
     */
    const nl_NL_Standard_E: Voice;
    /**
     * Google voice, Dutch (Netherlands) female. Powered by WaveNet.
     * @const
     */
    const nl_NL_Wavenet_A: Voice;
    /**
     * Google voice, Dutch (Netherlands) male. Powered by WaveNet.
     * @const
     */
    const nl_NL_Wavenet_B: Voice;
    /**
     * Google voice, Dutch (Netherlands) male (second voice). Powered by WaveNet.
     * @const
     */
    const nl_NL_Wavenet_C: Voice;
    /**
     * Google voice, Dutch (Netherlands) female (second voice). Powered by WaveNet.
     * @const
     */
    const nl_NL_Wavenet_D: Voice;
    /**
     * Google voice, Dutch (Netherlands) female (third voice). Powered by WaveNet.
     * @const
     */
    const nl_NL_Wavenet_E: Voice;
    /**
     * Google voice, English (Australia) female.
     * @const
     */
    const en_AU_Neural2_A: Voice;
    /**
     * Google voice, English (Australia) male.
     * @const
     */
    const en_AU_Neural2_B: Voice;
    /**
     * Google voice, English (Australia) female (second voice).
     * @const
     */
    const en_AU_Neural2_C: Voice;
    /**
     * Google voice, English (Australia) male (second voice).
     * @const
     */
    const en_AU_Neural2_D: Voice;
    /**
     * Google voice, English (Australia) female. Powered by WaveNet.
     * @const
     */
    const en_AU_News_E: Voice;
    /**
     * Google voice, English (Australia) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_AU_News_F: Voice;
    /**
     * Google voice, English (Australia) male. Powered by WaveNet.
     * @const
     */
    const en_AU_News_G: Voice;
    /**
     * Google voice, English (Australia) female.
     * @const
     */
    const en_AU_Standard_A: Voice;
    /**
     * Google voice, English (Australia) male.
     * @const
     */
    const en_AU_Standard_B: Voice;
    /**
     * Google voice, English (Australia) female (second voice).
     * @const
     */
    const en_AU_Standard_C: Voice;
    /**
     * Google voice, English (Australia) male (second voice).
     * @const
     */
    const en_AU_Standard_D: Voice;
    /**
     * Google voice, English (Australia) female. Powered by WaveNet.
     * @const
     */
    const en_AU_Wavenet_A: Voice;
    /**
     * Google voice, English (Australia) male. Powered by WaveNet.
     * @const
     */
    const en_AU_Wavenet_B: Voice;
    /**
     * Google voice, English (Australia) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_AU_Wavenet_C: Voice;
    /**
     * Google voice, English (Australia) male (second voice). Powered by WaveNet.
     * @const
     */
    const en_AU_Wavenet_D: Voice;
    /**
     * Google voice, English (India) female.
     * @const
     */
    const en_IN_Standard_A: Voice;
    /**
     * Google voice, English (India) male.
     * @const
     */
    const en_IN_Standard_B: Voice;
    /**
     * Google voice, English (India) male (second voice).
     * @const
     */
    const en_IN_Standard_C: Voice;
    /**
     * Google voice, English (India) female (second voice).
     * @const
     */
    const en_IN_Standard_D: Voice;
    /**
     * Google voice, English (India) female. Powered by WaveNet.
     * @const
     */
    const en_IN_Wavenet_A: Voice;
    /**
     * Google voice, English (India) male. Powered by WaveNet.
     * @const
     */
    const en_IN_Wavenet_B: Voice;
    /**
     * Google voice, English (India) male (second voice). Powered by WaveNet.
     * @const
     */
    const en_IN_Wavenet_C: Voice;
    /**
     * Google voice, English (India) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_IN_Wavenet_D: Voice;
    /**
     * Google voice, English (UK) female.
     * @const
     */
    const en_GB_Neural2_A: Voice;
    /**
     * Google voice, English (UK) male.
     * @const
     */
    const en_GB_Neural2_B: Voice;
    /**
     * Google voice, English (UK) female (second voice).
     * @const
     */
    const en_GB_Neural2_C: Voice;
    /**
     * Google voice, English (UK) male (second voice).
     * @const
     */
    const en_GB_Neural2_D: Voice;
    /**
     * Google voice, English (UK) female (third voice).
     * @const
     */
    const en_GB_Neural2_F: Voice;
    /**
     * Google voice, English (UK) female. Powered by WaveNet.
     * @const
     */
    const en_GB_News_G: Voice;
    /**
     * Google voice, English (UK) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_GB_News_H: Voice;
    /**
     * Google voice, English (UK) female (third voice). Powered by WaveNet.
     * @const
     */
    const en_GB_News_I: Voice;
    /**
     * Google voice, English (UK) male. Powered by WaveNet.
     * @const
     */
    const en_GB_News_J: Voice;
    /**
     * Google voice, English (UK) male (second voice). Powered by WaveNet.
     * @const
     */
    const en_GB_News_K: Voice;
    /**
     * Google voice, English (UK) male (third voice). Powered by WaveNet.
     * @const
     */
    const en_GB_News_L: Voice;
    /**
     * Google voice, English (UK) male (fourth voice). Powered by WaveNet.
     * @const
     */
    const en_GB_News_M: Voice;
    /**
     * Google voice, English (UK) female.
     * @const
     */
    const en_GB_Standard_A: Voice;
    /**
     * Google voice, English (UK) male.
     * @const
     */
    const en_GB_Standard_B: Voice;
    /**
     * Google voice, English (UK) female (second voice).
     * @const
     */
    const en_GB_Standard_C: Voice;
    /**
     * Google voice, English (UK) male (second voice).
     * @const
     */
    const en_GB_Standard_D: Voice;
    /**
     * Google voice, English (UK) female (third voice).
     * @const
     */
    const en_GB_Standard_F: Voice;
    /**
     * Google voice, English (UK) female. Powered by WaveNet.
     * @const
     */
    const en_GB_Wavenet_A: Voice;
    /**
     * Google voice, English (UK) male. Powered by WaveNet.
     * @const
     */
    const en_GB_Wavenet_B: Voice;
    /**
     * Google voice, English (UK) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_GB_Wavenet_C: Voice;
    /**
     * Google voice, English (UK) male (second voice). Powered by WaveNet.
     * @const
     */
    const en_GB_Wavenet_D: Voice;
    /**
     * Google voice, English (UK) female (third voice). Powered by WaveNet.
     * @const
     */
    const en_GB_Wavenet_F: Voice;
    /**
     * Google voice, English (US) male.
     * @const
     */
    const en_US_Neural2_A: Voice;
    /**
     * Google voice, English (US) female.
     * @const
     */
    const en_US_Neural2_C: Voice;
    /**
     * Google voice, English (US) male (second voice).
     * @const
     */
    const en_US_Neural2_D: Voice;
    /**
     * Google voice, English (US) female (second voice).
     * @const
     */
    const en_US_Neural2_E: Voice;
    /**
     * Google voice, English (US) female (third voice).
     * @const
     */
    const en_US_Neural2_F: Voice;
    /**
     * Google voice, English (US) female (fourth voice).
     * @const
     */
    const en_US_Neural2_G: Voice;
    /**
     * Google voice, English (US) female (fifth voice).
     * @const
     */
    const en_US_Neural2_H: Voice;
    /**
     * Google voice, English (US) male (third voice).
     * @const
     */
    const en_US_Neural2_I: Voice;
    /**
     * Google voice, English (US) male (fourth voice).
     * @const
     */
    const en_US_Neural2_J: Voice;
    /**
     * Google voice, English (US) female. Powered by WaveNet.
     * @const
     */
    const en_US_News_K: Voice;
    /**
     * Google voice, English (US) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_US_News_L: Voice;
    /**
     * Google voice, English (US) male. Powered by WaveNet.
     * @const
     */
    const en_US_News_M: Voice;
    /**
     * Google voice, English (US) male (second voice). Powered by WaveNet.
     * @const
     */
    const en_US_News_N: Voice;
    /**
     * Google voice, English (US) male.
     * @const
     */
    const en_US_Standard_A: Voice;
    /**
     * Google voice, English (US) male (second voice).
     * @const
     */
    const en_US_Standard_B: Voice;
    /**
     * Google voice, English (US) female.
     * @const
     */
    const en_US_Standard_C: Voice;
    /**
     * Google voice, English (US) male (third voice).
     * @const
     */
    const en_US_Standard_D: Voice;
    /**
     * Google voice, English (US) female (second voice).
     * @const
     */
    const en_US_Standard_E: Voice;
    /**
     * Google voice, English (US) female (third voice).
     * @const
     */
    const en_US_Standard_F: Voice;
    /**
     * Google voice, English (US) female (fourth voice).
     * @const
     */
    const en_US_Standard_G: Voice;
    /**
     * Google voice, English (US) female (fifth voice).
     * @const
     */
    const en_US_Standard_H: Voice;
    /**
     * Google voice, English (US) male (fourth voice).
     * @const
     */
    const en_US_Standard_I: Voice;
    /**
     * Google voice, English (US) male (fifth voice).
     * @const
     */
    const en_US_Standard_J: Voice;
    /**
     * Google voice, English (US) male.
     * @const
     */
    const en_US_Studio_M: Voice;
    /**
     * Google voice, English (US) female.
     * @const
     */
    const en_US_Studio_O: Voice;
    /**
     * Google voice, English (US) male. Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_A: Voice;
    /**
     * Google voice, English (US) male (second voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_B: Voice;
    /**
     * Google voice, English (US) female. Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_C: Voice;
    /**
     * Google voice, English (US) male (third voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_D: Voice;
    /**
     * Google voice, English (US) female (second voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_E: Voice;
    /**
     * Google voice, English (US) female (third voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_F: Voice;
    /**
     * Google voice, English (US) female (fourth voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_G: Voice;
    /**
     * Google voice, English (US) female (fifth voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_H: Voice;
    /**
     * Google voice, English (US) male (fourth voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_I: Voice;
    /**
     * Google voice, English (US) male (fifth voice). Powered by WaveNet.
     * @const
     */
    const en_US_Wavenet_J: Voice;
    /**
     * Google voice, Filipino (Philippines) female.
     * @const
     */
    const fil_PH_Standard_A: Voice;
    /**
     * Google voice, Filipino (Philippines) female (second voice).
     * @const
     */
    const fil_PH_Standard_B: Voice;
    /**
     * Google voice, Filipino (Philippines) male.
     * @const
     */
    const fil_PH_Standard_C: Voice;
    /**
     * Google voice, Filipino (Philippines) male (second voice).
     * @const
     */
    const fil_PH_Standard_D: Voice;
    /**
     * Google voice, Filipino (Philippines) female. Powered by WaveNet.
     * @const
     */
    const fil_PH_Wavenet_A: Voice;
    /**
     * Google voice, Filipino (Philippines) female (second voice). Powered by WaveNet.
     * @const
     */
    const fil_PH_Wavenet_B: Voice;
    /**
     * Google voice, Filipino (Philippines) male. Powered by WaveNet.
     * @const
     */
    const fil_PH_Wavenet_C: Voice;
    /**
     * Google voice, Filipino (Philippines) male (second voice). Powered by WaveNet.
     * @const
     */
    const fil_PH_Wavenet_D: Voice;
    /**
     * Google voice, Finnish (Finland) female.
     * @const
     */
    const fi_FI_Standard_A: Voice;
    /**
     * Google voice, Finnish (Finland) female. Powered by WaveNet.
     * @const
     */
    const fi_FI_Wavenet_A: Voice;
    /**
     * Google voice, French (Canada) female.
     * @const
     */
    const fr_CA_Neural2_A: Voice;
    /**
     * Google voice, French (Canada) male.
     * @const
     */
    const fr_CA_Neural2_B: Voice;
    /**
     * Google voice, French (Canada) female (second voice).
     * @const
     */
    const fr_CA_Neural2_C: Voice;
    /**
     * Google voice, French (Canada) male (second voice).
     * @const
     */
    const fr_CA_Neural2_D: Voice;
    /**
     * Google voice, French (Canada) female.
     * @const
     */
    const fr_CA_Standard_A: Voice;
    /**
     * Google voice, French (Canada) male.
     * @const
     */
    const fr_CA_Standard_B: Voice;
    /**
     * Google voice, French (Canada) female (second voice).
     * @const
     */
    const fr_CA_Standard_C: Voice;
    /**
     * Google voice, French (Canada) male (second voice).
     * @const
     */
    const fr_CA_Standard_D: Voice;
    /**
     * Google voice, French (Canada) female. Powered by WaveNet.
     * @const
     */
    const fr_CA_Wavenet_A: Voice;
    /**
     * Google voice, French (Canada) male. Powered by WaveNet.
     * @const
     */
    const fr_CA_Wavenet_B: Voice;
    /**
     * Google voice, French (Canada) female (second voice). Powered by WaveNet.
     * @const
     */
    const fr_CA_Wavenet_C: Voice;
    /**
     * Google voice, French (Canada) male (second voice). Powered by WaveNet.
     * @const
     */
    const fr_CA_Wavenet_D: Voice;
    /**
     * Google voice, French (France) female.
     * @const
     */
    const fr_FR_Neural2_A: Voice;
    /**
     * Google voice, French (France) male.
     * @const
     */
    const fr_FR_Neural2_B: Voice;
    /**
     * Google voice, French (France) female (second voice).
     * @const
     */
    const fr_FR_Neural2_C: Voice;
    /**
     * Google voice, French (France) male (second voice).
     * @const
     */
    const fr_FR_Neural2_D: Voice;
    /**
     * Google voice, French (France) female (third voice).
     * @const
     */
    const fr_FR_Neural2_E: Voice;
    /**
     * Google voice, French (France) female.
     * @const
     */
    const fr_FR_Standard_A: Voice;
    /**
     * Google voice, French (France) male.
     * @const
     */
    const fr_FR_Standard_B: Voice;
    /**
     * Google voice, French (France) female (second voice).
     * @const
     */
    const fr_FR_Standard_C: Voice;
    /**
     * Google voice, French (France) male (second voice).
     * @const
     */
    const fr_FR_Standard_D: Voice;
    /**
     * Google voice, French (France) female (third voice).
     * @const
     */
    const fr_FR_Standard_E: Voice;
    /**
     * Google voice, French (France) female. Powered by WaveNet.
     * @const
     */
    const fr_FR_Wavenet_A: Voice;
    /**
     * Google voice, French (France) male. Powered by WaveNet.
     * @const
     */
    const fr_FR_Wavenet_B: Voice;
    /**
     * Google voice, French (France) female (second voice). Powered by WaveNet.
     * @const
     */
    const fr_FR_Wavenet_C: Voice;
    /**
     * Google voice, French (France) male (second voice). Powered by WaveNet.
     * @const
     */
    const fr_FR_Wavenet_D: Voice;
    /**
     * Google voice, French (France) female (third voice). Powered by WaveNet.
     * @const
     */
    const fr_FR_Wavenet_E: Voice;
    /**
     * Google voice, Galician (Spain) female.
     * @const
     */
    const gl_ES_Standard_A: Voice;
    /**
     * Google voice, German (Germany) male.
     * @const
     */
    const de_DE_Neural2_B: Voice;
    /**
     * Google voice, German (Germany) female.
     * @const
     */
    const de_DE_Neural2_C: Voice;
    /**
     * Google voice, German (Germany) male (second voice).
     * @const
     */
    const de_DE_Neural2_D: Voice;
    /**
     * Google voice, German (Germany) female (second voice).
     * @const
     */
    const de_DE_Neural2_F: Voice;
    /**
     * Google voice, German (Germany) female.
     * @const
     */
    const de_DE_Standard_A: Voice;
    /**
     * Google voice, German (Germany) male.
     * @const
     */
    const de_DE_Standard_B: Voice;
    /**
     * Google voice, German (Germany) female (second voice).
     * @const
     */
    const de_DE_Standard_C: Voice;
    /**
     * Google voice, German (Germany) male (second voice).
     * @const
     */
    const de_DE_Standard_D: Voice;
    /**
     * Google voice, German (Germany) male (third voice).
     * @const
     */
    const de_DE_Standard_E: Voice;
    /**
     * Google voice, German (Germany) female (third voice).
     * @const
     */
    const de_DE_Standard_F: Voice;
    /**
     * Google voice, German (Germany) female. Powered by WaveNet.
     * @const
     */
    const de_DE_Wavenet_A: Voice;
    /**
     * Google voice, German (Germany) male. Powered by WaveNet.
     * @const
     */
    const de_DE_Wavenet_B: Voice;
    /**
     * Google voice, German (Germany) female (second voice). Powered by WaveNet.
     * @const
     */
    const de_DE_Wavenet_C: Voice;
    /**
     * Google voice, German (Germany) male (second voice). Powered by WaveNet.
     * @const
     */
    const de_DE_Wavenet_D: Voice;
    /**
     * Google voice, German (Germany) male (third voice). Powered by WaveNet.
     * @const
     */
    const de_DE_Wavenet_E: Voice;
    /**
     * Google voice, German (Germany) female (third voice). Powered by WaveNet.
     * @const
     */
    const de_DE_Wavenet_F: Voice;
    /**
     * Google voice, Greek (Greece) female.
     * @const
     */
    const el_GR_Standard_A: Voice;
    /**
     * Google voice, Greek (Greece) female. Powered by WaveNet.
     * @const
     */
    const el_GR_Wavenet_A: Voice;
    /**
     * Google voice, Gujarati (India) female.
     * @const
     */
    const gu_IN_Standard_A: Voice;
    /**
     * Google voice, Gujarati (India) male.
     * @const
     */
    const gu_IN_Standard_B: Voice;
    /**
     * Google voice, Gujarati (India) female. Powered by WaveNet.
     * @const
     */
    const gu_IN_Wavenet_A: Voice;
    /**
     * Google voice, Gujarati (India) male. Powered by WaveNet.
     * @const
     */
    const gu_IN_Wavenet_B: Voice;
    /**
     * Google voice, Hebrew (Israel) female.
     * @const
     */
    const he_IL_Standard_A: Voice;
    /**
     * Google voice, Hebrew (Israel) male.
     * @const
     */
    const he_IL_Standard_B: Voice;
    /**
     * Google voice, Hebrew (Israel) female (second voice).
     * @const
     */
    const he_IL_Standard_C: Voice;
    /**
     * Google voice, Hebrew (Israel) male (second voice).
     * @const
     */
    const he_IL_Standard_D: Voice;
    /**
     * Google voice, Hebrew (Israel) female. Powered by WaveNet.
     * @const
     */
    const he_IL_Wavenet_A: Voice;
    /**
     * Google voice, Hebrew (Israel) male. Powered by WaveNet.
     * @const
     */
    const he_IL_Wavenet_B: Voice;
    /**
     * Google voice, Hebrew (Israel) female (second voice). Powered by WaveNet.
     * @const
     */
    const he_IL_Wavenet_C: Voice;
    /**
     * Google voice, Hebrew (Israel) male (second voice). Powered by WaveNet.
     * @const
     */
    const he_IL_Wavenet_D: Voice;
    /**
     * Google voice, Hindi (India) female.
     * @const
     */
    const hi_IN_Neural2_A: Voice;
    /**
     * Google voice, Hindi (India) male.
     * @const
     */
    const hi_IN_Neural2_B: Voice;
    /**
     * Google voice, Hindi (India) male (second voice).
     * @const
     */
    const hi_IN_Neural2_C: Voice;
    /**
     * Google voice, Hindi (India) female (second voice).
     * @const
     */
    const hi_IN_Neural2_D: Voice;
    /**
     * Google voice, Hindi (India) female.
     * @const
     */
    const hi_IN_Standard_A: Voice;
    /**
     * Google voice, Hindi (India) male.
     * @const
     */
    const hi_IN_Standard_B: Voice;
    /**
     * Google voice, Hindi (India) male (second voice).
     * @const
     */
    const hi_IN_Standard_C: Voice;
    /**
     * Google voice, Hindi (India) female (second voice).
     * @const
     */
    const hi_IN_Standard_D: Voice;
    /**
     * Google voice, Hindi (India) female. Powered by WaveNet.
     * @const
     */
    const hi_IN_Wavenet_A: Voice;
    /**
     * Google voice, Hindi (India) male. Powered by WaveNet.
     * @const
     */
    const hi_IN_Wavenet_B: Voice;
    /**
     * Google voice, Hindi (India) male (second voice). Powered by WaveNet.
     * @const
     */
    const hi_IN_Wavenet_C: Voice;
    /**
     * Google voice, Hindi (India) female (second voice). Powered by WaveNet.
     * @const
     */
    const hi_IN_Wavenet_D: Voice;
    /**
     * Google voice, Hungarian (Hungary) female.
     * @const
     */
    const hu_HU_Standard_A: Voice;
    /**
     * Google voice, Hungarian (Hungary) female. Powered by WaveNet.
     * @const
     */
    const hu_HU_Wavenet_A: Voice;
    /**
     * Google voice, Icelandic (Iceland) female.
     * @const
     */
    const is_IS_Standard_A: Voice;
    /**
     * Google voice, Indonesian (Indonesia) female.
     * @const
     */
    const id_ID_Standard_A: Voice;
    /**
     * Google voice, Indonesian (Indonesia) male.
     * @const
     */
    const id_ID_Standard_B: Voice;
    /**
     * Google voice, Indonesian (Indonesia) male (second voice).
     * @const
     */
    const id_ID_Standard_C: Voice;
    /**
     * Google voice, Indonesian (Indonesia) female (second voice).
     * @const
     */
    const id_ID_Standard_D: Voice;
    /**
     * Google voice, Indonesian (Indonesia) female. Powered by WaveNet.
     * @const
     */
    const id_ID_Wavenet_A: Voice;
    /**
     * Google voice, Indonesian (Indonesia) male. Powered by WaveNet.
     * @const
     */
    const id_ID_Wavenet_B: Voice;
    /**
     * Google voice, Indonesian (Indonesia) male (second voice). Powered by WaveNet.
     * @const
     */
    const id_ID_Wavenet_C: Voice;
    /**
     * Google voice, Indonesian (Indonesia) female (second voice). Powered by WaveNet.
     * @const
     */
    const id_ID_Wavenet_D: Voice;
    /**
     * Google voice, Italian (Italy) female.
     * @const
     */
    const it_IT_Neural2_A: Voice;
    /**
     * Google voice, Italian (Italy) male.
     * @const
     */
    const it_IT_Neural2_C: Voice;
    /**
     * Google voice, Italian (Italy) female.
     * @const
     */
    const it_IT_Standard_A: Voice;
    /**
     * Google voice, Italian (Italy) female (second voice).
     * @const
     */
    const it_IT_Standard_B: Voice;
    /**
     * Google voice, Italian (Italy) male.
     * @const
     */
    const it_IT_Standard_C: Voice;
    /**
     * Google voice, Italian (Italy) male (second voice).
     * @const
     */
    const it_IT_Standard_D: Voice;
    /**
     * Google voice, Italian (Italy) female. Powered by WaveNet.
     * @const
     */
    const it_IT_Wavenet_A: Voice;
    /**
     * Google voice, Italian (Italy) female (second voice). Powered by WaveNet.
     * @const
     */
    const it_IT_Wavenet_B: Voice;
    /**
     * Google voice, Italian (Italy) male. Powered by WaveNet.
     * @const
     */
    const it_IT_Wavenet_C: Voice;
    /**
     * Google voice, Italian (Italy) male (second voice). Powered by WaveNet.
     * @const
     */
    const it_IT_Wavenet_D: Voice;
    /**
     * Google voice, Japanese (Japan) female.
     * @const
     */
    const ja_JP_Neural2_B: Voice;
    /**
     * Google voice, Japanese (Japan) male.
     * @const
     */
    const ja_JP_Neural2_C: Voice;
    /**
     * Google voice, Japanese (Japan) male (second voice).
     * @const
     */
    const ja_JP_Neural2_D: Voice;
    /**
     * Google voice, Japanese (Japan) female.
     * @const
     */
    const ja_JP_Standard_A: Voice;
    /**
     * Google voice, Japanese (Japan) female (second voice).
     * @const
     */
    const ja_JP_Standard_B: Voice;
    /**
     * Google voice, Japanese (Japan) male.
     * @const
     */
    const ja_JP_Standard_C: Voice;
    /**
     * Google voice, Japanese (Japan) male (second voice).
     * @const
     */
    const ja_JP_Standard_D: Voice;
    /**
     * Google voice, Japanese (Japan) female. Powered by WaveNet.
     * @const
     */
    const ja_JP_Wavenet_A: Voice;
    /**
     * Google voice, Japanese (Japan) female (second voice). Powered by WaveNet.
     * @const
     */
    const ja_JP_Wavenet_B: Voice;
    /**
     * Google voice, Japanese (Japan) male. Powered by WaveNet.
     * @const
     */
    const ja_JP_Wavenet_C: Voice;
    /**
     * Google voice, Japanese (Japan) male (second voice). Powered by WaveNet.
     * @const
     */
    const ja_JP_Wavenet_D: Voice;
    /**
     * Google voice, Kannada (India) female.
     * @const
     */
    const kn_IN_Standard_A: Voice;
    /**
     * Google voice, Kannada (India) male.
     * @const
     */
    const kn_IN_Standard_B: Voice;
    /**
     * Google voice, Kannada (India) female. Powered by WaveNet.
     * @const
     */
    const kn_IN_Wavenet_A: Voice;
    /**
     * Google voice, Kannada (India) male. Powered by WaveNet.
     * @const
     */
    const kn_IN_Wavenet_B: Voice;
    /**
     * Google voice, Korean (South Korea) female.
     * @const
     */
    const ko_KR_Neural2_A: Voice;
    /**
     * Google voice, Korean (South Korea) female (second voice).
     * @const
     */
    const ko_KR_Neural2_B: Voice;
    /**
     * Google voice, Korean (South Korea) male.
     * @const
     */
    const ko_KR_Neural2_C: Voice;
    /**
     * Google voice, Korean (South Korea) female.
     * @const
     */
    const ko_KR_Standard_A: Voice;
    /**
     * Google voice, Korean (South Korea) female (second voice).
     * @const
     */
    const ko_KR_Standard_B: Voice;
    /**
     * Google voice, Korean (South Korea) male.
     * @const
     */
    const ko_KR_Standard_C: Voice;
    /**
     * Google voice, Korean (South Korea) male (second voice).
     * @const
     */
    const ko_KR_Standard_D: Voice;
    /**
     * Google voice, Korean (South Korea) female. Powered by WaveNet.
     * @const
     */
    const ko_KR_Wavenet_A: Voice;
    /**
     * Google voice, Korean (South Korea) female (second voice). Powered by WaveNet.
     * @const
     */
    const ko_KR_Wavenet_B: Voice;
    /**
     * Google voice, Korean (South Korea) male. Powered by WaveNet.
     * @const
     */
    const ko_KR_Wavenet_C: Voice;
    /**
     * Google voice, Korean (South Korea) male (second voice). Powered by WaveNet.
     * @const
     */
    const ko_KR_Wavenet_D: Voice;
    /**
     * Google voice, Latvian (Latvia) male.
     * @const
     */
    const lv_LV_Standard_A: Voice;
    /**
     * Google voice, Lithuanian (Lithuania) male.
     * @const
     */
    const lt_LT_Standard_A: Voice;
    /**
     * Google voice, Malay (Malaysia) female.
     * @const
     */
    const ms_MY_Standard_A: Voice;
    /**
     * Google voice, Malay (Malaysia) male.
     * @const
     */
    const ms_MY_Standard_B: Voice;
    /**
     * Google voice, Malay (Malaysia) female (second voice).
     * @const
     */
    const ms_MY_Standard_C: Voice;
    /**
     * Google voice, Malay (Malaysia) male (second voice).
     * @const
     */
    const ms_MY_Standard_D: Voice;
    /**
     * Google voice, Malay (Malaysia) female. Powered by WaveNet.
     * @const
     */
    const ms_MY_Wavenet_A: Voice;
    /**
     * Google voice, Malay (Malaysia) male. Powered by WaveNet.
     * @const
     */
    const ms_MY_Wavenet_B: Voice;
    /**
     * Google voice, Malay (Malaysia) female (second voice). Powered by WaveNet.
     * @const
     */
    const ms_MY_Wavenet_C: Voice;
    /**
     * Google voice, Malay (Malaysia) male (second voice). Powered by WaveNet.
     * @const
     */
    const ms_MY_Wavenet_D: Voice;
    /**
     * Google voice, Malayalam (India) female.
     * @const
     */
    const ml_IN_Standard_A: Voice;
    /**
     * Google voice, Malayalam (India) male.
     * @const
     */
    const ml_IN_Standard_B: Voice;
    /**
     * Google voice, Malayalam (India) female. Powered by WaveNet.
     * @const
     */
    const ml_IN_Wavenet_A: Voice;
    /**
     * Google voice, Malayalam (India) male. Powered by WaveNet.
     * @const
     */
    const ml_IN_Wavenet_B: Voice;
    /**
     * Google voice, Malayalam (India) female (second voice). Powered by WaveNet.
     * @const
     */
    const ml_IN_Wavenet_C: Voice;
    /**
     * Google voice, Malayalam (India) male (second voice). Powered by WaveNet.
     * @const
     */
    const ml_IN_Wavenet_D: Voice;
    /**
     * Google voice, Mandarin Chinese female.
     * @const
     */
    const cmn_CN_Standard_A: Voice;
    /**
     * Google voice, Mandarin Chinese male.
     * @const
     */
    const cmn_CN_Standard_B: Voice;
    /**
     * Google voice, Mandarin Chinese male (second voice).
     * @const
     */
    const cmn_CN_Standard_C: Voice;
    /**
     * Google voice, Mandarin Chinese female (second voice).
     * @const
     */
    const cmn_CN_Standard_D: Voice;
    /**
     * Google voice, Mandarin Chinese female. Powered by WaveNet.
     * @const
     */
    const cmn_CN_Wavenet_A: Voice;
    /**
     * Google voice, Mandarin Chinese male. Powered by WaveNet.
     * @const
     */
    const cmn_CN_Wavenet_B: Voice;
    /**
     * Google voice, Mandarin Chinese male (second voice). Powered by WaveNet.
     * @const
     */
    const cmn_CN_Wavenet_C: Voice;
    /**
     * Google voice, Mandarin Chinese female (second voice). Powered by WaveNet.
     * @const
     */
    const cmn_CN_Wavenet_D: Voice;
    /**
     * Google voice, Mandarin Chinese female.
     * @const
     */
    const cmn_TW_Standard_A: Voice;
    /**
     * Google voice, Mandarin Chinese male.
     * @const
     */
    const cmn_TW_Standard_B: Voice;
    /**
     * Google voice, Mandarin Chinese male (second voice).
     * @const
     */
    const cmn_TW_Standard_C: Voice;
    /**
     * Google voice, Mandarin Chinese female. Powered by WaveNet.
     * @const
     */
    const cmn_TW_Wavenet_A: Voice;
    /**
     * Google voice, Mandarin Chinese male. Powered by WaveNet.
     * @const
     */
    const cmn_TW_Wavenet_B: Voice;
    /**
     * Google voice, Mandarin Chinese male (second voice). Powered by WaveNet.
     * @const
     */
    const cmn_TW_Wavenet_C: Voice;
    /**
     * Google voice, Marathi (India) female.
     * @const
     */
    const mr_IN_Standard_A: Voice;
    /**
     * Google voice, Marathi (India) male.
     * @const
     */
    const mr_IN_Standard_B: Voice;
    /**
     * Google voice, Marathi (India) female (second voice).
     * @const
     */
    const mr_IN_Standard_C: Voice;
    /**
     * Google voice, Marathi (India) female. Powered by WaveNet.
     * @const
     */
    const mr_IN_Wavenet_A: Voice;
    /**
     * Google voice, Marathi (India) male. Powered by WaveNet.
     * @const
     */
    const mr_IN_Wavenet_B: Voice;
    /**
     * Google voice, Marathi (India) female (second voice). Powered by WaveNet.
     * @const
     */
    const mr_IN_Wavenet_C: Voice;
    /**
     * Google voice, Norwegian (Norway) female.
     * @const
     */
    const nb_NO_Standard_A: Voice;
    /**
     * Google voice, Norwegian (Norway) male.
     * @const
     */
    const nb_NO_Standard_B: Voice;
    /**
     * Google voice, Norwegian (Norway) female (second voice).
     * @const
     */
    const nb_NO_Standard_C: Voice;
    /**
     * Google voice, Norwegian (Norway) male (second voice).
     * @const
     */
    const nb_NO_Standard_D: Voice;
    /**
     * Google voice, Norwegian (Norway) female (third voice).
     * @const
     */
    const nb_NO_Standard_E: Voice;
    /**
     * Google voice, Norwegian (Norway) female. Powered by WaveNet.
     * @const
     */
    const nb_NO_Wavenet_A: Voice;
    /**
     * Google voice, Norwegian (Norway) male. Powered by WaveNet.
     * @const
     */
    const nb_NO_Wavenet_B: Voice;
    /**
     * Google voice, Norwegian (Norway) female (second voice). Powered by WaveNet.
     * @const
     */
    const nb_NO_Wavenet_C: Voice;
    /**
     * Google voice, Norwegian (Norway) male (second voice). Powered by WaveNet.
     * @const
     */
    const nb_NO_Wavenet_D: Voice;
    /**
     * Google voice, Norwegian (Norway) female (third voice). Powered by WaveNet.
     * @const
     */
    const nb_NO_Wavenet_E: Voice;
    /**
     * Google voice, Polish (Poland) female.
     * @const
     */
    const pl_PL_Standard_A: Voice;
    /**
     * Google voice, Polish (Poland) male.
     * @const
     */
    const pl_PL_Standard_B: Voice;
    /**
     * Google voice, Polish (Poland) male (second voice).
     * @const
     */
    const pl_PL_Standard_C: Voice;
    /**
     * Google voice, Polish (Poland) female (second voice).
     * @const
     */
    const pl_PL_Standard_D: Voice;
    /**
     * Google voice, Polish (Poland) female (third voice).
     * @const
     */
    const pl_PL_Standard_E: Voice;
    /**
     * Google voice, Polish (Poland) female. Powered by WaveNet.
     * @const
     */
    const pl_PL_Wavenet_A: Voice;
    /**
     * Google voice, Polish (Poland) male. Powered by WaveNet.
     * @const
     */
    const pl_PL_Wavenet_B: Voice;
    /**
     * Google voice, Polish (Poland) male (second voice). Powered by WaveNet.
     * @const
     */
    const pl_PL_Wavenet_C: Voice;
    /**
     * Google voice, Polish (Poland) female (second voice). Powered by WaveNet.
     * @const
     */
    const pl_PL_Wavenet_D: Voice;
    /**
     * Google voice, Polish (Poland) female (third voice). Powered by WaveNet.
     * @const
     */
    const pl_PL_Wavenet_E: Voice;
    /**
     * Google voice, Portuguese (Brazil) female.
     * @const
     */
    const pt_BR_Neural2_A: Voice;
    /**
     * Google voice, Portuguese (Brazil) male.
     * @const
     */
    const pt_BR_Neural2_B: Voice;
    /**
     * Google voice, Portuguese (Brazil) female (second voice).
     * @const
     */
    const pt_BR_Neural2_C: Voice;
    /**
     * Google voice, Portuguese (Brazil) female.
     * @const
     */
    const pt_BR_Standard_A: Voice;
    /**
     * Google voice, Portuguese (Brazil) male.
     * @const
     */
    const pt_BR_Standard_B: Voice;
    /**
     * Google voice, Portuguese (Brazil) female (second voice).
     * @const
     */
    const pt_BR_Standard_C: Voice;
    /**
     * Google voice, Portuguese (Brazil) female. Powered by WaveNet.
     * @const
     */
    const pt_BR_Wavenet_A: Voice;
    /**
     * Google voice, Portuguese (Brazil) male. Powered by WaveNet.
     * @const
     */
    const pt_BR_Wavenet_B: Voice;
    /**
     * Google voice, Portuguese (Brazil) female (second voice). Powered by WaveNet.
     * @const
     */
    const pt_BR_Wavenet_C: Voice;
    /**
     * Google voice, Portuguese (Portugal) female.
     * @const
     */
    const pt_PT_Standard_A: Voice;
    /**
     * Google voice, Portuguese (Portugal) male.
     * @const
     */
    const pt_PT_Standard_B: Voice;
    /**
     * Google voice, Portuguese (Portugal) male (second voice).
     * @const
     */
    const pt_PT_Standard_C: Voice;
    /**
     * Google voice, Portuguese (Portugal) female (second voice).
     * @const
     */
    const pt_PT_Standard_D: Voice;
    /**
     * Google voice, Portuguese (Portugal) female. Powered by WaveNet.
     * @const
     */
    const pt_PT_Wavenet_A: Voice;
    /**
     * Google voice, Portuguese (Portugal) male. Powered by WaveNet.
     * @const
     */
    const pt_PT_Wavenet_B: Voice;
    /**
     * Google voice, Portuguese (Portugal) male (second voice). Powered by WaveNet.
     * @const
     */
    const pt_PT_Wavenet_C: Voice;
    /**
     * Google voice, Portuguese (Portugal) female (second voice). Powered by WaveNet.
     * @const
     */
    const pt_PT_Wavenet_D: Voice;
    /**
     * Google voice, Punjabi (India) female.
     * @const
     */
    const pa_IN_Standard_A: Voice;
    /**
     * Google voice, Punjabi (India) male.
     * @const
     */
    const pa_IN_Standard_B: Voice;
    /**
     * Google voice, Punjabi (India) female (second voice).
     * @const
     */
    const pa_IN_Standard_C: Voice;
    /**
     * Google voice, Punjabi (India) male (second voice).
     * @const
     */
    const pa_IN_Standard_D: Voice;
    /**
     * Google voice, Punjabi (India) female. Powered by WaveNet.
     * @const
     */
    const pa_IN_Wavenet_A: Voice;
    /**
     * Google voice, Punjabi (India) male. Powered by WaveNet.
     * @const
     */
    const pa_IN_Wavenet_B: Voice;
    /**
     * Google voice, Punjabi (India) female (second voice). Powered by WaveNet.
     * @const
     */
    const pa_IN_Wavenet_C: Voice;
    /**
     * Google voice, Punjabi (India) male (second voice). Powered by WaveNet.
     * @const
     */
    const pa_IN_Wavenet_D: Voice;
    /**
     * Google voice, Romanian (Romania) female.
     * @const
     */
    const ro_RO_Standard_A: Voice;
    /**
     * Google voice, Romanian (Romania) female. Powered by WaveNet.
     * @const
     */
    const ro_RO_Wavenet_A: Voice;
    /**
     * Google voice, Russian (Russia) female.
     * @const
     */
    const ru_RU_Standard_A: Voice;
    /**
     * Google voice, Russian (Russia) male.
     * @const
     */
    const ru_RU_Standard_B: Voice;
    /**
     * Google voice, Russian (Russia) female (second voice).
     * @const
     */
    const ru_RU_Standard_C: Voice;
    /**
     * Google voice, Russian (Russia) male (second voice).
     * @const
     */
    const ru_RU_Standard_D: Voice;
    /**
     * Google voice, Russian (Russia) female (third voice).
     * @const
     */
    const ru_RU_Standard_E: Voice;
    /**
     * Google voice, Russian (Russia) female. Powered by WaveNet.
     * @const
     */
    const ru_RU_Wavenet_A: Voice;
    /**
     * Google voice, Russian (Russia) male. Powered by WaveNet.
     * @const
     */
    const ru_RU_Wavenet_B: Voice;
    /**
     * Google voice, Russian (Russia) female (second voice). Powered by WaveNet.
     * @const
     */
    const ru_RU_Wavenet_C: Voice;
    /**
     * Google voice, Russian (Russia) male (second voice). Powered by WaveNet.
     * @const
     */
    const ru_RU_Wavenet_D: Voice;
    /**
     * Google voice, Russian (Russia) female (third voice). Powered by WaveNet.
     * @const
     */
    const ru_RU_Wavenet_E: Voice;
    /**
     * Google voice, Serbian (Cyrillic) female.
     * @const
     */
    const sr_RS_Standard_A: Voice;
    /**
     * Google voice, Slovak (Slovakia) female.
     * @const
     */
    const sk_SK_Standard_A: Voice;
    /**
     * Google voice, Slovak (Slovakia) female. Powered by WaveNet.
     * @const
     */
    const sk_SK_Wavenet_A: Voice;
    /**
     * Google voice, Spanish (Spain) female.
     * @const
     */
    const es_ES_Neural2_A: Voice;
    /**
     * Google voice, Spanish (Spain) male.
     * @const
     */
    const es_ES_Neural2_B: Voice;
    /**
     * Google voice, Spanish (Spain) female (second voice).
     * @const
     */
    const es_ES_Neural2_C: Voice;
    /**
     * Google voice, Spanish (Spain) female (third voice).
     * @const
     */
    const es_ES_Neural2_D: Voice;
    /**
     * Google voice, Spanish (Spain) female (fourth voice).
     * @const
     */
    const es_ES_Neural2_E: Voice;
    /**
     * Google voice, Spanish (Spain) male (second voice).
     * @const
     */
    const es_ES_Neural2_F: Voice;
    /**
     * Google voice, Spanish (Spain) female.
     * @const
     */
    const es_ES_Standard_A: Voice;
    /**
     * Google voice, Spanish (Spain) male.
     * @const
     */
    const es_ES_Standard_B: Voice;
    /**
     * Google voice, Spanish (Spain) female (second voice).
     * @const
     */
    const es_ES_Standard_C: Voice;
    /**
     * Google voice, Spanish (Spain) female (third voice).
     * @const
     */
    const es_ES_Standard_D: Voice;
    /**
     * Google voice, Spanish (Spain) male. Powered by WaveNet.
     * @const
     */
    const es_ES_Wavenet_B: Voice;
    /**
     * Google voice, Spanish (Spain) female. Powered by WaveNet.
     * @const
     */
    const es_ES_Wavenet_C: Voice;
    /**
     * Google voice, Spanish (Spain) female (second voice). Powered by WaveNet.
     * @const
     */
    const es_ES_Wavenet_D: Voice;
    /**
     * Google voice, Spanish (US) female.
     * @const
     */
    const es_US_Neural2_A: Voice;
    /**
     * Google voice, Spanish (US) male.
     * @const
     */
    const es_US_Neural2_B: Voice;
    /**
     * Google voice, Spanish (US) male (second voice).
     * @const
     */
    const es_US_Neural2_C: Voice;
    /**
     * Google voice, Spanish (US) male. Powered by WaveNet.
     * @const
     */
    const es_US_News_D: Voice;
    /**
     * Google voice, Spanish (US) male (second voice). Powered by WaveNet.
     * @const
     */
    const es_US_News_E: Voice;
    /**
     * Google voice, Spanish (US) female. Powered by WaveNet.
     * @const
     */
    const es_US_News_F: Voice;
    /**
     * Google voice, Spanish (US) female (second voice). Powered by WaveNet.
     * @const
     */
    const es_US_News_G: Voice;
    /**
     * Google voice, Spanish (US) female.
     * @const
     */
    const es_US_Standard_A: Voice;
    /**
     * Google voice, Spanish (US) male.
     * @const
     */
    const es_US_Standard_B: Voice;
    /**
     * Google voice, Spanish (US) male (second voice).
     * @const
     */
    const es_US_Standard_C: Voice;
    /**
     * Google voice, Spanish (US) male.
     * @const
     */
    const es_US_Studio_B: Voice;
    /**
     * Google voice, Spanish (US) female. Powered by WaveNet.
     * @const
     */
    const es_US_Wavenet_A: Voice;
    /**
     * Google voice, Spanish (US) male. Powered by WaveNet.
     * @const
     */
    const es_US_Wavenet_B: Voice;
    /**
     * Google voice, Spanish (US) male (second voice). Powered by WaveNet.
     * @const
     */
    const es_US_Wavenet_C: Voice;
    /**
     * Google voice, Swedish (Sweden) female.
     * @const
     */
    const sv_SE_Standard_A: Voice;
    /**
     * Google voice, Swedish (Sweden) female (second voice).
     * @const
     */
    const sv_SE_Standard_B: Voice;
    /**
     * Google voice, Swedish (Sweden) female (third voice).
     * @const
     */
    const sv_SE_Standard_C: Voice;
    /**
     * Google voice, Swedish (Sweden) male.
     * @const
     */
    const sv_SE_Standard_D: Voice;
    /**
     * Google voice, Swedish (Sweden) male (second voice).
     * @const
     */
    const sv_SE_Standard_E: Voice;
    /**
     * Google voice, Swedish (Sweden) female. Powered by WaveNet.
     * @const
     */
    const sv_SE_Wavenet_A: Voice;
    /**
     * Google voice, Swedish (Sweden) female (second voice). Powered by WaveNet.
     * @const
     */
    const sv_SE_Wavenet_B: Voice;
    /**
     * Google voice, Swedish (Sweden) male. Powered by WaveNet.
     * @const
     */
    const sv_SE_Wavenet_C: Voice;
    /**
     * Google voice, Swedish (Sweden) female (third voice). Powered by WaveNet.
     * @const
     */
    const sv_SE_Wavenet_D: Voice;
    /**
     * Google voice, Swedish (Sweden) male (second voice). Powered by WaveNet.
     * @const
     */
    const sv_SE_Wavenet_E: Voice;
    /**
     * Google voice, Tamil (India) female.
     * @const
     */
    const ta_IN_Standard_A: Voice;
    /**
     * Google voice, Tamil (India) male.
     * @const
     */
    const ta_IN_Standard_B: Voice;
    /**
     * Google voice, Tamil (India) female (second voice).
     * @const
     */
    const ta_IN_Standard_C: Voice;
    /**
     * Google voice, Tamil (India) male (second voice).
     * @const
     */
    const ta_IN_Standard_D: Voice;
    /**
     * Google voice, Tamil (India) female. Powered by WaveNet.
     * @const
     */
    const ta_IN_Wavenet_A: Voice;
    /**
     * Google voice, Tamil (India) male. Powered by WaveNet.
     * @const
     */
    const ta_IN_Wavenet_B: Voice;
    /**
     * Google voice, Tamil (India) female (second voice). Powered by WaveNet.
     * @const
     */
    const ta_IN_Wavenet_C: Voice;
    /**
     * Google voice, Tamil (India) male (second voice). Powered by WaveNet.
     * @const
     */
    const ta_IN_Wavenet_D: Voice;
    /**
     * Google voice, Telugu (India) female.
     * @const
     */
    const te_IN_Standard_A: Voice;
    /**
     * Google voice, Telugu (India) male.
     * @const
     */
    const te_IN_Standard_B: Voice;
    /**
     * Google voice, Thai (Thailand) female.
     * @const
     */
    const th_TH_Neural2_C: Voice;
    /**
     * Google voice, Thai (Thailand) female.
     * @const
     */
    const th_TH_Standard_A: Voice;
    /**
     * Google voice, Turkish (Turkey) female.
     * @const
     */
    const tr_TR_Standard_A: Voice;
    /**
     * Google voice, Turkish (Turkey) male.
     * @const
     */
    const tr_TR_Standard_B: Voice;
    /**
     * Google voice, Turkish (Turkey) female (second voice).
     * @const
     */
    const tr_TR_Standard_C: Voice;
    /**
     * Google voice, Turkish (Turkey) female (third voice).
     * @const
     */
    const tr_TR_Standard_D: Voice;
    /**
     * Google voice, Turkish (Turkey) male (second voice).
     * @const
     */
    const tr_TR_Standard_E: Voice;
    /**
     * Google voice, Turkish (Turkey) female. Powered by WaveNet.
     * @const
     */
    const tr_TR_Wavenet_A: Voice;
    /**
     * Google voice, Turkish (Turkey) male. Powered by WaveNet.
     * @const
     */
    const tr_TR_Wavenet_B: Voice;
    /**
     * Google voice, Turkish (Turkey) female (second voice). Powered by WaveNet.
     * @const
     */
    const tr_TR_Wavenet_C: Voice;
    /**
     * Google voice, Turkish (Turkey) female (third voice). Powered by WaveNet.
     * @const
     */
    const tr_TR_Wavenet_D: Voice;
    /**
     * Google voice, Turkish (Turkey) male (second voice). Powered by WaveNet.
     * @const
     */
    const tr_TR_Wavenet_E: Voice;
    /**
     * Google voice, Ukrainian (Ukraine) female.
     * @const
     */
    const uk_UA_Standard_A: Voice;
    /**
     * Google voice, Ukrainian (Ukraine) female. Powered by WaveNet.
     * @const
     */
    const uk_UA_Wavenet_A: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) female.
     * @const
     */
    const vi_VN_Standard_A: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male.
     * @const
     */
    const vi_VN_Standard_B: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) female (second voice).
     * @const
     */
    const vi_VN_Standard_C: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male (second voice).
     * @const
     */
    const vi_VN_Standard_D: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) female. Powered by WaveNet.
     * @const
     */
    const vi_VN_Wavenet_A: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male. Powered by WaveNet.
     * @const
     */
    const vi_VN_Wavenet_B: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) female (second voice). Powered by WaveNet.
     * @const
     */
    const vi_VN_Wavenet_C: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male (second voice). Powered by WaveNet.
     * @const
     */
    const vi_VN_Wavenet_D: Voice;
  }
}

declare namespace VoiceList {
  /**
   * List of IBM languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   * @beta
   */
  namespace IBM {
    /** * IBM voice, Arabic(Beta) male, Omar.
     * @beta
     * @const
     */
    const ar_AR_Omar: Voice;
    /** * IBM voice, Brazilian Portuguese female, Isabela.
     * @const
     */
    const pt_BR_Isabela: Voice;
    /** * IBM voice, Chinese(Mandarin, Beta) female, LiNa.
     * @const
     */
    const zh_CN_LiNa: Voice;
    /** * IBM voice, Chinese(Mandarin, Beta) male, WangWei.
     * @const
     */
    const zh_CN_WangWei: Voice;
    /** * IBM voice, Chinese(Mandarin, Beta) female, ZhangJing.
     * @const
     */
    const zh_CN_ZhangJing: Voice;
    /** * IBM voice, Dutch(Beta) female, Emma.
     * @beta
     * @const
     */
    const nl_NL_Emma: Voice;
    /** * IBM voice, Dutch(Beta) male, Liam.
     * @beta
     * @const
     */
    const nl_NL_Liam: Voice;
    /** * IBM voice, English(United Kingdom) female, Kate.
     * @const
     */
    const en_GB_Kate: Voice;
    /** * IBM voice, English(United States) female, Allison.
     * @const
     */
    const en_US_Allison: Voice;
    /** * IBM voice, English(United States) female, Lisa.
     * @const
     */
    const en_US_Lisa: Voice;
    /** * IBM voice, English(United States) male, Michael.
     * @const
     */
    const en_US_Michael: Voice;
    /** * IBM voice, French female, Renee.
     * @const
     */
    const fr_FR_Renee: Voice;
    /** * IBM voice, German female, Birgit.
     * @const
     */
    const de_DE_Birgit: Voice;
    /** * IBM voice, German male, Dieter.
     * @const
     */
    const de_DE_Dieter: Voice;
    /** * IBM voice, Italian female, Francesca.
     * @const
     */
    const it_IT_Francesca: Voice;
    /** * IBM voice, Japanese female, Emi.
     * @const
     */
    const ja_JP_Emi: Voice;
    /** * IBM voice, Korean(Beta) female, Youngmi.
     * @beta
     * @const
     */
    const ko_KR_Youngmi: Voice;
    /** * IBM voice, Korean(Beta) female, Yuna.
     * @beta
     * @const
     */
    const ko_KR_Yuna: Voice;
    /** * IBM voice, Spanish(Castilian) male, Enrique.
     * @const
     */
    const es_ES_Enrique: Voice;
    /** * IBM voice, Spanish(Castilian) female, Laura.
     * @const
     */
    const es_ES_Laura: Voice;
    /** * IBM voice, Spanish(Latin American) female, Sofia.
     * @const
     */
    const es_LA_Sofia: Voice;
    /** * IBM voice, Spanish(North American) female, Sofia.
     * @const
     */
    const es_US_Sofia: Voice;
  }
}

declare namespace VoiceList {
  namespace IBM {
    /**
     * Premium voices that sound more natural due to advanced synthesis technology.
     * @namespace
     */
    namespace Neural {
      /** * Neural IBM voice, Brazilian Portuguese female, Isabela.
       * @const
       */
      const pt_BR_Isabela: Voice;
      /** * Neural IBM voice, English(United Kingdom) female, Kate.
       * @const
       */
      const en_GB_Kate: Voice;
      /** * Neural IBM voice, English(United States) female, Allison.
       * @const
       */
      const en_US_Allison: Voice;
      /** * Neural IBM voice, English(United States) female, Emily.
       * @const
       */
      const en_US_Emily: Voice;
      /** * Neural IBM voice, English(United States) male, Henry.
       * @const
       */
      const en_US_Henry: Voice;
      /** * Neural IBM voice, English(United States) male, Kevin.
       * @const
       */
      const en_US_Kevin: Voice;
      /** * Neural IBM voice, English(United States) female, Lisa.
       * @const
       */
      const en_US_Lisa: Voice;
      /** * Neural IBM voice, English(United States) male, Michael.
       * @const
       */
      const en_US_Michael: Voice;
      /** * Neural IBM voice, English(United States) female, Olivia.
       * @const
       */
      const en_US_Olivia: Voice;
      /** * Neural IBM voice, French female, Renee.
       * @const
       */
      const fr_FR_Renee: Voice;
      /** * Neural IBM voice, German female, Birgit.
       * @const
       */
      const de_DE_Birgit: Voice;
      /** * Neural IBM voice, German male, Dieter.
       * @const
       */
      const de_DE_Dieter: Voice;
      /** * Neural IBM voice, German female, Erika.
       * @const
       */
      const de_DE_Erika: Voice;
      /** * Neural IBM voice, Italian female, Francesca.
       * @const
       */
      const it_IT_Francesca: Voice;
      /** * Neural IBM voice, Japanese female, Emi.
       * @const
       */
      const ja_JP_Emi: Voice;
      /** * Neural IBM voice, Spanish(Castilian) male, Enrique.
       * @const
       */
      const es_ES_Enrique: Voice;
      /** * Neural IBM voice, Spanish(Castilian) female, Laura.
       * @const
       */
      const es_ES_Laura: Voice;
      /** * Neural IBM voice, Spanish(Latin American) female, Sofia.
       * @const
       */
      const es_LA_Sofia: Voice;
      /** * Neural IBM voice, Spanish(North American) female, Sofia.
       * @const
       */
      const es_US_Sofia: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of Microsoft languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Microsoft {
  }
}
declare namespace VoiceList {
  namespace Microsoft {
    /**
     * Premium voices that sound more natural due to advanced synthesis technology.
     * @namespace
     */
    namespace Neural {
      /**
       * Neural Microsoft voice, Afrikaans (South Africa) Female, AdriNeural.
       * @const
       */
      const af_ZA_AdriNeural: Voice;

      /**
       * Neural Microsoft voice, Afrikaans (South Africa) Male, WillemNeural.
       * @const
       */
      const af_ZA_WillemNeural: Voice;

      /**
       * Neural Microsoft voice, Amharic (Ethiopia) Male, AmehaNeural.
       * @const
       */
      const am_ET_AmehaNeural: Voice;

      /**
       * Neural Microsoft voice, Amharic (Ethiopia) Female, MekdesNeural.
       * @const
       */
      const am_ET_MekdesNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (United Arab Emirates) Female, FatimaNeural.
       * @const
       */
      const ar_AE_FatimaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (United Arab Emirates) Male, HamdanNeural.
       * @const
       */
      const ar_AE_HamdanNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Bahrain) Male, AliNeural.
       * @const
       */
      const ar_BH_AliNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Bahrain) Female, LailaNeural.
       * @const
       */
      const ar_BH_LailaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Algeria) Female, AminaNeural.
       * @const
       */
      const ar_DZ_AminaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Algeria) Male, IsmaelNeural.
       * @const
       */
      const ar_DZ_IsmaelNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Egypt) Female, SalmaNeural.
       * @const
       */
      const ar_EG_SalmaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Egypt) Male, ShakirNeural.
       * @const
       */
      const ar_EG_ShakirNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Iraq) Male, BasselNeural.
       * @const
       */
      const ar_IQ_BasselNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Iraq) Female, RanaNeural.
       * @const
       */
      const ar_IQ_RanaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Jordan) Female, SanaNeural.
       * @const
       */
      const ar_JO_SanaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Jordan) Male, TaimNeural.
       * @const
       */
      const ar_JO_TaimNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Kuwait) Male, FahedNeural.
       * @const
       */
      const ar_KW_FahedNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Kuwait) Female, NouraNeural.
       * @const
       */
      const ar_KW_NouraNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Lebanon) Female, LaylaNeural.
       * @const
       */
      const ar_LB_LaylaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Lebanon) Male, RamiNeural.
       * @const
       */
      const ar_LB_RamiNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Libya) Female, ImanNeural.
       * @const
       */
      const ar_LY_ImanNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Libya) Male, OmarNeural.
       * @const
       */
      const ar_LY_OmarNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Morocco) Male, JamalNeural.
       * @const
       */
      const ar_MA_JamalNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Morocco) Female, MounaNeural.
       * @const
       */
      const ar_MA_MounaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Oman) Male, AbdullahNeural.
       * @const
       */
      const ar_OM_AbdullahNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Oman) Female, AyshaNeural.
       * @const
       */
      const ar_OM_AyshaNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Qatar) Female, AmalNeural.
       * @const
       */
      const ar_QA_AmalNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Qatar) Male, MoazNeural.
       * @const
       */
      const ar_QA_MoazNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Saudi Arabia) Male, HamedNeural.
       * @const
       */
      const ar_SA_HamedNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Saudi Arabia) Female, ZariyahNeural.
       * @const
       */
      const ar_SA_ZariyahNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Syria) Female, AmanyNeural.
       * @const
       */
      const ar_SY_AmanyNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Syria) Male, LaithNeural.
       * @const
       */
      const ar_SY_LaithNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Tunisia) Male, HediNeural.
       * @const
       */
      const ar_TN_HediNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Tunisia) Female, ReemNeural.
       * @const
       */
      const ar_TN_ReemNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Yemen) Female, MaryamNeural.
       * @const
       */
      const ar_YE_MaryamNeural: Voice;

      /**
       * Neural Microsoft voice, Arabic (Yemen) Male, SalehNeural.
       * @const
       */
      const ar_YE_SalehNeural: Voice;

      /**
       * Neural Microsoft voice, Azerbaijani (Latin, Azerbaijan) Male, BabekNeural.
       * @const
       */
      const az_AZ_BabekNeural: Voice;

      /**
       * Neural Microsoft voice, Azerbaijani (Latin, Azerbaijan) Female, BanuNeural.
       * @const
       */
      const az_AZ_BanuNeural: Voice;

      /**
       * Neural Microsoft voice, Bulgarian (Bulgaria) Male, BorislavNeural.
       * @const
       */
      const bg_BG_BorislavNeural: Voice;

      /**
       * Neural Microsoft voice, Bulgarian (Bulgaria) Female, KalinaNeural.
       * @const
       */
      const bg_BG_KalinaNeural: Voice;

      /**
       * Neural Microsoft voice, Bangla (Bangladesh) Female, NabanitaNeural.
       * @const
       */
      const bn_BD_NabanitaNeural: Voice;

      /**
       * Neural Microsoft voice, Bangla (Bangladesh) Male, PradeepNeural.
       * @const
       */
      const bn_BD_PradeepNeural: Voice;

      /**
       * Neural Microsoft voice, Bengali (India) Male, BashkarNeural.
       * @const
       */
      const bn_IN_BashkarNeural: Voice;

      /**
       * Neural Microsoft voice, Bengali (India) Female, TanishaaNeural.
       * @const
       */
      const bn_IN_TanishaaNeural: Voice;

      /**
       * Neural Microsoft voice, Bosnian (Bosnia and Herzegovina) Male, GoranNeural.
       * @const
       */
      const bs_BA_GoranNeural: Voice;

      /**
       * Neural Microsoft voice, Bosnian (Bosnia and Herzegovina) Female, VesnaNeural.
       * @const
       */
      const bs_BA_VesnaNeural: Voice;

      /**
       * Neural Microsoft voice, Catalan (Spain) Female, JoanaNeural.
       * @const
       */
      const ca_ES_JoanaNeural: Voice;

      /**
       * Neural Microsoft voice, Catalan (Spain) Female, AlbaNeural.
       * @const
       */
      const ca_ES_AlbaNeural: Voice;

      /**
       * Neural Microsoft voice, Catalan (Spain) Male, EnricNeural.
       * @const
       */
      const ca_ES_EnricNeural: Voice;

      /**
       * Neural Microsoft voice, Czech (Czechia) Male, AntoninNeural.
       * @const
       */
      const cs_CZ_AntoninNeural: Voice;

      /**
       * Neural Microsoft voice, Czech (Czechia) Female, VlastaNeural.
       * @const
       */
      const cs_CZ_VlastaNeural: Voice;

      /**
       * Neural Microsoft voice, Welsh (United Kingdom) Male, AledNeural.
       * @const
       */
      const cy_GB_AledNeural: Voice;

      /**
       * Neural Microsoft voice, Welsh (United Kingdom) Female, NiaNeural.
       * @const
       */
      const cy_GB_NiaNeural: Voice;

      /**
       * Neural Microsoft voice, Danish (Denmark) Female, ChristelNeural.
       * @const
       */
      const da_DK_ChristelNeural: Voice;

      /**
       * Neural Microsoft voice, Danish (Denmark) Male, JeppeNeural.
       * @const
       */
      const da_DK_JeppeNeural: Voice;

      /**
       * Neural Microsoft voice, German (Austria) Female, IngridNeural.
       * @const
       */
      const de_AT_IngridNeural: Voice;

      /**
       * Neural Microsoft voice, German (Austria) Male, JonasNeural.
       * @const
       */
      const de_AT_JonasNeural: Voice;

      /**
       * Neural Microsoft voice, German (Switzerland) Male, JanNeural.
       * @const
       */
      const de_CH_JanNeural: Voice;

      /**
       * Neural Microsoft voice, German (Switzerland) Female, LeniNeural.
       * @const
       */
      const de_CH_LeniNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, KatjaNeural.
       * @const
       */
      const de_DE_KatjaNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, AmalaNeural.
       * @const
       */
      const de_DE_AmalaNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, BerndNeural.
       * @const
       */
      const de_DE_BerndNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, ChristophNeural.
       * @const
       */
      const de_DE_ChristophNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, ConradNeural.
       * @const
       */
      const de_DE_ConradNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, ElkeNeural.
       * @const
       */
      const de_DE_ElkeNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, GiselaNeural.
       * @const
       */
      const de_DE_GiselaNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, KasperNeural.
       * @const
       */
      const de_DE_KasperNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, KillianNeural.
       * @const
       */
      const de_DE_KillianNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, KlarissaNeural.
       * @const
       */
      const de_DE_KlarissaNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, KlausNeural.
       * @const
       */
      const de_DE_KlausNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, LouisaNeural.
       * @const
       */
      const de_DE_LouisaNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, MajaNeural.
       * @const
       */
      const de_DE_MajaNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Male, RalfNeural.
       * @const
       */
      const de_DE_RalfNeural: Voice;

      /**
       * Neural Microsoft voice, German (Germany) Female, TanjaNeural.
       * @const
       */
      const de_DE_TanjaNeural: Voice;

      /**
       * Neural Microsoft voice, Greek (Greece) Female, AthinaNeural.
       * @const
       */
      const el_GR_AthinaNeural: Voice;

      /**
       * Neural Microsoft voice, Greek (Greece) Male, NestorasNeural.
       * @const
       */
      const el_GR_NestorasNeural: Voice;

      /**
       * Neural Microsoft voice, English (Australia) Female, NatashaNeural.
       * @const
       */
      const en_AU_NatashaNeural: Voice;

      /**
       * Neural Microsoft voice, English (Australia) Male, WilliamNeural.
       * @const
       */
      const en_AU_WilliamNeural: Voice;

      /**
       * Neural Microsoft voice, English (Canada) Female, ClaraNeural.
       * @const
       */
      const en_CA_ClaraNeural: Voice;

      /**
       * Neural Microsoft voice, English (Canada) Male, LiamNeural.
       * @const
       */
      const en_CA_LiamNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, LibbyNeural.
       * @const
       */
      const en_GB_LibbyNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, AbbiNeural.
       * @const
       */
      const en_GB_AbbiNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, AlfieNeural.
       * @const
       */
      const en_GB_AlfieNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, BellaNeural.
       * @const
       */
      const en_GB_BellaNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, ElliotNeural.
       * @const
       */
      const en_GB_ElliotNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, EthanNeural.
       * @const
       */
      const en_GB_EthanNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, HollieNeural.
       * @const
       */
      const en_GB_HollieNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, MaisieNeural.
       * @const
       */
      const en_GB_MaisieNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, NoahNeural.
       * @const
       */
      const en_GB_NoahNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, OliverNeural.
       * @const
       */
      const en_GB_OliverNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, OliviaNeural.
       * @const
       */
      const en_GB_OliviaNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, RyanNeural.
       * @const
       */
      const en_GB_RyanNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, SoniaNeural.
       * @const
       */
      const en_GB_SoniaNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Male, ThomasNeural.
       * @const
       */
      const en_GB_ThomasNeural: Voice;

      /**
       * Neural Microsoft voice, English (United Kingdom) Female, MiaNeural.
       * @const
       */
      const en_GB_MiaNeural: Voice;

      /**
       * Neural Microsoft voice, English (Hong Kong SAR) Male, SamNeural.
       * @const
       */
      const en_HK_SamNeural: Voice;

      /**
       * Neural Microsoft voice, English (Hong Kong SAR) Female, YanNeural.
       * @const
       */
      const en_HK_YanNeural: Voice;

      /**
       * Neural Microsoft voice, English (Ireland) Male, ConnorNeural.
       * @const
       */
      const en_IE_ConnorNeural: Voice;

      /**
       * Neural Microsoft voice, English (Ireland) Female, EmilyNeural.
       * @const
       */
      const en_IE_EmilyNeural: Voice;

      /**
       * Neural Microsoft voice, English (India) Female, NeerjaNeural.
       * @const
       */
      const en_IN_NeerjaNeural: Voice;

      /**
       * Neural Microsoft voice, English (India) Male, PrabhatNeural.
       * @const
       */
      const en_IN_PrabhatNeural: Voice;

      /**
       * Neural Microsoft voice, English (Kenya) Female, AsiliaNeural.
       * @const
       */
      const en_KE_AsiliaNeural: Voice;

      /**
       * Neural Microsoft voice, English (Kenya) Male, ChilembaNeural.
       * @const
       */
      const en_KE_ChilembaNeural: Voice;

      /**
       * Neural Microsoft voice, English (Nigeria) Male, AbeoNeural.
       * @const
       */
      const en_NG_AbeoNeural: Voice;

      /**
       * Neural Microsoft voice, English (Nigeria) Female, EzinneNeural.
       * @const
       */
      const en_NG_EzinneNeural: Voice;

      /**
       * Neural Microsoft voice, English (New Zealand) Male, MitchellNeural.
       * @const
       */
      const en_NZ_MitchellNeural: Voice;

      /**
       * Neural Microsoft voice, English (New Zealand) Female, MollyNeural.
       * @const
       */
      const en_NZ_MollyNeural: Voice;

      /**
       * Neural Microsoft voice, English (Philippines) Male, JamesNeural.
       * @const
       */
      const en_PH_JamesNeural: Voice;

      /**
       * Neural Microsoft voice, English (Philippines) Female, RosaNeural.
       * @const
       */
      const en_PH_RosaNeural: Voice;

      /**
       * Neural Microsoft voice, English (Singapore) Female, LunaNeural.
       * @const
       */
      const en_SG_LunaNeural: Voice;

      /**
       * Neural Microsoft voice, English (Singapore) Male, WayneNeural.
       * @const
       */
      const en_SG_WayneNeural: Voice;

      /**
       * Neural Microsoft voice, English (Tanzania) Male, ElimuNeural.
       * @const
       */
      const en_TZ_ElimuNeural: Voice;

      /**
       * Neural Microsoft voice, English (Tanzania) Female, ImaniNeural.
       * @const
       */
      const en_TZ_ImaniNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, JennyNeural.
       * @const
       */
      const en_US_JennyNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, JennyMultilingualNeural.
       * @const
       */
      const en_US_JennyMultilingualNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, GuyNeural.
       * @const
       */
      const en_US_GuyNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, AmberNeural.
       * @const
       */
      const en_US_AmberNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, AnaNeural.
       * @const
       */
      const en_US_AnaNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, AriaNeural.
       * @const
       */
      const en_US_AriaNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, AshleyNeural.
       * @const
       */
      const en_US_AshleyNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, BrandonNeural.
       * @const
       */
      const en_US_BrandonNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, ChristopherNeural.
       * @const
       */
      const en_US_ChristopherNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, CoraNeural.
       * @const
       */
      const en_US_CoraNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, DavisNeural.
       * @const
       */
      const en_US_DavisNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, ElizabethNeural.
       * @const
       */
      const en_US_ElizabethNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, EricNeural.
       * @const
       */
      const en_US_EricNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, JacobNeural.
       * @const
       */
      const en_US_JacobNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, JaneNeural.
       * @const
       */
      const en_US_JaneNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, JasonNeural.
       * @const
       */
      const en_US_JasonNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, MichelleNeural.
       * @const
       */
      const en_US_MichelleNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, MonicaNeural.
       * @const
       */
      const en_US_MonicaNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, NancyNeural.
       * @const
       */
      const en_US_NancyNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Female, SaraNeural.
       * @const
       */
      const en_US_SaraNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, SteffanNeural.
       * @const
       */
      const en_US_SteffanNeural: Voice;

      /**
       * Neural Microsoft voice, English (United States) Male, TonyNeural.
       * @const
       */
      const en_US_TonyNeural: Voice;

      /**
       * Neural Microsoft voice, English (South Africa) Female, LeahNeural.
       * @const
       */
      const en_ZA_LeahNeural: Voice;

      /**
       * Neural Microsoft voice, English (South Africa) Male, LukeNeural.
       * @const
       */
      const en_ZA_LukeNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Argentina) Female, ElenaNeural.
       * @const
       */
      const es_AR_ElenaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Argentina) Male, TomasNeural.
       * @const
       */
      const es_AR_TomasNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Bolivia) Male, MarceloNeural.
       * @const
       */
      const es_BO_MarceloNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Bolivia) Female, SofiaNeural.
       * @const
       */
      const es_BO_SofiaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Chile) Female, CatalinaNeural.
       * @const
       */
      const es_CL_CatalinaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Chile) Male, LorenzoNeural.
       * @const
       */
      const es_CL_LorenzoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Colombia) Male, GonzaloNeural.
       * @const
       */
      const es_CO_GonzaloNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Colombia) Female, SalomeNeural.
       * @const
       */
      const es_CO_SalomeNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Costa Rica) Male, JuanNeural.
       * @const
       */
      const es_CR_JuanNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Costa Rica) Female, MariaNeural.
       * @const
       */
      const es_CR_MariaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Cuba) Female, BelkysNeural.
       * @const
       */
      const es_CU_BelkysNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Cuba) Male, ManuelNeural.
       * @const
       */
      const es_CU_ManuelNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Dominican Republic) Male, EmilioNeural.
       * @const
       */
      const es_DO_EmilioNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Dominican Republic) Female, RamonaNeural.
       * @const
       */
      const es_DO_RamonaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Ecuador) Female, AndreaNeural.
       * @const
       */
      const es_EC_AndreaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Ecuador) Male, LuisNeural.
       * @const
       */
      const es_EC_LuisNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Spain) Male, AlvaroNeural.
       * @const
       */
      const es_ES_AlvaroNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Spain) Female, ElviraNeural.
       * @const
       */
      const es_ES_ElviraNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Equatorial Guinea) Male, JavierNeural.
       * @const
       */
      const es_GQ_JavierNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Equatorial Guinea) Female, TeresaNeural.
       * @const
       */
      const es_GQ_TeresaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Guatemala) Male, AndresNeural.
       * @const
       */
      const es_GT_AndresNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Guatemala) Female, MartaNeural.
       * @const
       */
      const es_GT_MartaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Honduras) Male, CarlosNeural.
       * @const
       */
      const es_HN_CarlosNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Honduras) Female, KarlaNeural.
       * @const
       */
      const es_HN_KarlaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, BeatrizNeural.
       * @const
       */
      const es_MX_BeatrizNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, CandelaNeural.
       * @const
       */
      const es_MX_CandelaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, CarlotaNeural.
       * @const
       */
      const es_MX_CarlotaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, CecilioNeural.
       * @const
       */
      const es_MX_CecilioNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, DaliaNeural.
       * @const
       */
      const es_MX_DaliaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, GerardoNeural.
       * @const
       */
      const es_MX_GerardoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, JorgeNeural.
       * @const
       */
      const es_MX_JorgeNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, LarissaNeural.
       * @const
       */
      const es_MX_LarissaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, LibertoNeural.
       * @const
       */
      const es_MX_LibertoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, LucianoNeural.
       * @const
       */
      const es_MX_LucianoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, MarinaNeural.
       * @const
       */
      const es_MX_MarinaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, NuriaNeural.
       * @const
       */
      const es_MX_NuriaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, PelayoNeural.
       * @const
       */
      const es_MX_PelayoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, RenataNeural.
       * @const
       */
      const es_MX_RenataNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, YagoNeural.
       * @const
       */
      const es_MX_YagoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Nicaragua) Male, FedericoNeural.
       * @const
       */
      const es_NI_FedericoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Nicaragua) Female, YolandaNeural.
       * @const
       */
      const es_NI_YolandaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Panama) Female, MargaritaNeural.
       * @const
       */
      const es_PA_MargaritaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Panama) Male, RobertoNeural.
       * @const
       */
      const es_PA_RobertoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Peru) Male, AlexNeural.
       * @const
       */
      const es_PE_AlexNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Peru) Female, CamilaNeural.
       * @const
       */
      const es_PE_CamilaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Puerto Rico) Female, KarinaNeural.
       * @const
       */
      const es_PR_KarinaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Puerto Rico) Male, VictorNeural.
       * @const
       */
      const es_PR_VictorNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Paraguay) Male, MarioNeural.
       * @const
       */
      const es_PY_MarioNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Paraguay) Female, TaniaNeural.
       * @const
       */
      const es_PY_TaniaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (El Salvador) Female, LorenaNeural.
       * @const
       */
      const es_SV_LorenaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (El Salvador) Male, RodrigoNeural.
       * @const
       */
      const es_SV_RodrigoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (United States) Male, AlonsoNeural.
       * @const
       */
      const es_US_AlonsoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (United States) Female, PalomaNeural.
       * @const
       */
      const es_US_PalomaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Uruguay) Male, MateoNeural.
       * @const
       */
      const es_UY_MateoNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Uruguay) Female, ValentinaNeural.
       * @const
       */
      const es_UY_ValentinaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Venezuela) Female, PaolaNeural.
       * @const
       */
      const es_VE_PaolaNeural: Voice;

      /**
       * Neural Microsoft voice, Spanish (Venezuela) Male, SebastianNeural.
       * @const
       */
      const es_VE_SebastianNeural: Voice;

      /**
       * Neural Microsoft voice, Estonian (Estonia) Female, AnuNeural.
       * @const
       */
      const et_EE_AnuNeural: Voice;

      /**
       * Neural Microsoft voice, Estonian (Estonia) Male, KertNeural.
       * @const
       */
      const et_EE_KertNeural: Voice;

      /**
       * Neural Microsoft voice, Basque Female, AinhoaNeural.
       * @const
       */
      const eu_ES_AinhoaNeural: Voice;

      /**
       * Neural Microsoft voice, Basque Male, AnderNeural.
       * @const
       */
      const eu_ES_AnderNeural: Voice;

      /**
       * Neural Microsoft voice, Persian (Iran) Female, DilaraNeural.
       * @const
       */
      const fa_IR_DilaraNeural: Voice;

      /**
       * Neural Microsoft voice, Persian (Iran) Male, FaridNeural.
       * @const
       */
      const fa_IR_FaridNeural: Voice;

      /**
       * Neural Microsoft voice, Finnish (Finland) Female, SelmaNeural.
       * @const
       */
      const fi_FI_SelmaNeural: Voice;

      /**
       * Neural Microsoft voice, Finnish (Finland) Male, HarriNeural.
       * @const
       */
      const fi_FI_HarriNeural: Voice;

      /**
       * Neural Microsoft voice, Finnish (Finland) Female, NooraNeural.
       * @const
       */
      const fi_FI_NooraNeural: Voice;

      /**
       * Neural Microsoft voice, Filipino (Philippines) Male, AngeloNeural.
       * @const
       */
      const fil_PH_AngeloNeural: Voice;

      /**
       * Neural Microsoft voice, Filipino (Philippines) Female, BlessicaNeural.
       * @const
       */
      const fil_PH_BlessicaNeural: Voice;

      /**
       * Neural Microsoft voice, French (Belgium) Female, CharlineNeural.
       * @const
       */
      const fr_BE_CharlineNeural: Voice;

      /**
       * Neural Microsoft voice, French (Belgium) Male, GerardNeural.
       * @const
       */
      const fr_BE_GerardNeural: Voice;

      /**
       * Neural Microsoft voice, French (Canada) Female, SylvieNeural.
       * @const
       */
      const fr_CA_SylvieNeural: Voice;

      /**
       * Neural Microsoft voice, French (Canada) Male, AntoineNeural.
       * @const
       */
      const fr_CA_AntoineNeural: Voice;

      /**
       * Neural Microsoft voice, French (Canada) Male, JeanNeural.
       * @const
       */
      const fr_CA_JeanNeural: Voice;

      /**
       * Neural Microsoft voice, French (Switzerland) Female, ArianeNeural.
       * @const
       */
      const fr_CH_ArianeNeural: Voice;

      /**
       * Neural Microsoft voice, French (Switzerland) Male, FabriceNeural.
       * @const
       */
      const fr_CH_FabriceNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Male, AlainNeural.
       * @const
       */
      const fr_FR_AlainNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, BrigitteNeural.
       * @const
       */
      const fr_FR_BrigitteNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, CelesteNeural.
       * @const
       */
      const fr_FR_CelesteNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Male, ClaudeNeural.
       * @const
       */
      const fr_FR_ClaudeNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, CoralieNeural.
       * @const
       */
      const fr_FR_CoralieNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, DeniseNeural.
       * @const
       */
      const fr_FR_DeniseNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, EloiseNeural.
       * @const
       */
      const fr_FR_EloiseNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Male, HenriNeural.
       * @const
       */
      const fr_FR_HenriNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, JacquelineNeural.
       * @const
       */
      const fr_FR_JacquelineNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Male, JeromeNeural.
       * @const
       */
      const fr_FR_JeromeNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, JosephineNeural.
       * @const
       */
      const fr_FR_JosephineNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Male, MauriceNeural.
       * @const
       */
      const fr_FR_MauriceNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Male, YvesNeural.
       * @const
       */
      const fr_FR_YvesNeural: Voice;

      /**
       * Neural Microsoft voice, French (France) Female, YvetteNeural.
       * @const
       */
      const fr_FR_YvetteNeural: Voice;

      /**
       * Neural Microsoft voice, Irish (Ireland) Male, ColmNeural.
       * @const
       */
      const ga_IE_ColmNeural: Voice;

      /**
       * Neural Microsoft voice, Irish (Ireland) Female, OrlaNeural.
       * @const
       */
      const ga_IE_OrlaNeural: Voice;

      /**
       * Neural Microsoft voice, Galician Male, RoiNeural.
       * @const
       */
      const gl_ES_RoiNeural: Voice;

      /**
       * Neural Microsoft voice, Galician Female, SabelaNeural.
       * @const
       */
      const gl_ES_SabelaNeural: Voice;

      /**
       * Neural Microsoft voice, Gujarati (India) Female, DhwaniNeural.
       * @const
       */
      const gu_IN_DhwaniNeural: Voice;

      /**
       * Neural Microsoft voice, Gujarati (India) Male, NiranjanNeural.
       * @const
       */
      const gu_IN_NiranjanNeural: Voice;

      /**
       * Neural Microsoft voice, Hebrew (Israel) Male, AvriNeural.
       * @const
       */
      const he_IL_AvriNeural: Voice;

      /**
       * Neural Microsoft voice, Hebrew (Israel) Female, HilaNeural.
       * @const
       */
      const he_IL_HilaNeural: Voice;

      /**
       * Neural Microsoft voice, Hindi (India) Male, MadhurNeural.
       * @const
       */
      const hi_IN_MadhurNeural: Voice;

      /**
       * Neural Microsoft voice, Hindi (India) Female, SwaraNeural.
       * @const
       */
      const hi_IN_SwaraNeural: Voice;

      /**
       * Neural Microsoft voice, Croatian (Croatia) Female, GabrijelaNeural.
       * @const
       */
      const hr_HR_GabrijelaNeural: Voice;

      /**
       * Neural Microsoft voice, Croatian (Croatia) Male, SreckoNeural.
       * @const
       */
      const hr_HR_SreckoNeural: Voice;

      /**
       * Neural Microsoft voice, Hungarian (Hungary) Female, NoemiNeural.
       * @const
       */
      const hu_HU_NoemiNeural: Voice;

      /**
       * Neural Microsoft voice, Hungarian (Hungary) Male, TamasNeural.
       * @const
       */
      const hu_HU_TamasNeural: Voice;

      /**
       * Neural Microsoft voice, Armenian (Armenia) Female, AnahitNeural.
       * @const
       */
      const hy_AM_AnahitNeural: Voice;

      /**
       * Neural Microsoft voice, Armenian (Armenia) Male, HaykNeural.
       * @const
       */
      const hy_AM_HaykNeural: Voice;

      /**
       * Neural Microsoft voice, Indonesian (Indonesia) Male, ArdiNeural.
       * @const
       */
      const id_ID_ArdiNeural: Voice;

      /**
       * Neural Microsoft voice, Indonesian (Indonesia) Female, GadisNeural.
       * @const
       */
      const id_ID_GadisNeural: Voice;

      /**
       * Neural Microsoft voice, Icelandic (Iceland) Female, GudrunNeural.
       * @const
       */
      const is_IS_GudrunNeural: Voice;

      /**
       * Neural Microsoft voice, Icelandic (Iceland) Male, GunnarNeural.
       * @const
       */
      const is_IS_GunnarNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, IsabellaNeural.
       * @const
       */
      const it_IT_IsabellaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, BenignoNeural.
       * @const
       */
      const it_IT_BenignoNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, CalimeroNeural.
       * @const
       */
      const it_IT_CalimeroNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, CataldoNeural.
       * @const
       */
      const it_IT_CataldoNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, DiegoNeural.
       * @const
       */
      const it_IT_DiegoNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, ElsaNeural.
       * @const
       */
      const it_IT_ElsaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, FabiolaNeural.
       * @const
       */
      const it_IT_FabiolaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, FiammaNeural.
       * @const
       */
      const it_IT_FiammaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, GianniNeural.
       * @const
       */
      const it_IT_GianniNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, ImeldaNeural.
       * @const
       */
      const it_IT_ImeldaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, IrmaNeural.
       * @const
       */
      const it_IT_IrmaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, LisandroNeural.
       * @const
       */
      const it_IT_LisandroNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, PalmiraNeural.
       * @const
       */
      const it_IT_PalmiraNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Female, PierinaNeural.
       * @const
       */
      const it_IT_PierinaNeural: Voice;

      /**
       * Neural Microsoft voice, Italian (Italy) Male, RinaldoNeural.
       * @const
       */
      const it_IT_RinaldoNeural: Voice;

      /**
       * Neural Microsoft voice, Japanese (Japan) Female, NanamiNeural.
       * @const
       */
      const ja_JP_NanamiNeural: Voice;

      /**
       * Neural Microsoft voice, Japanese (Japan) Male, KeitaNeural.
       * @const
       */
      const ja_JP_KeitaNeural: Voice;

      /**
       * Neural Microsoft voice, Javanese (Latin, Indonesia) Male, DimasNeural.
       * @const
       */
      const jv_ID_DimasNeural: Voice;

      /**
       * Neural Microsoft voice, Javanese (Latin, Indonesia) Female, SitiNeural.
       * @const
       */
      const jv_ID_SitiNeural: Voice;

      /**
       * Neural Microsoft voice, Georgian (Georgia) Female, EkaNeural.
       * @const
       */
      const ka_GE_EkaNeural: Voice;

      /**
       * Neural Microsoft voice, Georgian (Georgia) Male, GiorgiNeural.
       * @const
       */
      const ka_GE_GiorgiNeural: Voice;

      /**
       * Neural Microsoft voice, Kazakh (Kazakhstan) Female, AigulNeural.
       * @const
       */
      const kk_KZ_AigulNeural: Voice;

      /**
       * Neural Microsoft voice, Kazakh (Kazakhstan) Male, DauletNeural.
       * @const
       */
      const kk_KZ_DauletNeural: Voice;

      /**
       * Neural Microsoft voice, Khmer (Cambodia) Male, PisethNeural.
       * @const
       */
      const km_KH_PisethNeural: Voice;

      /**
       * Neural Microsoft voice, Khmer (Cambodia) Female, SreymomNeural.
       * @const
       */
      const km_KH_SreymomNeural: Voice;

      /**
       * Neural Microsoft voice, Kannada (India) Male, GaganNeural.
       * @const
       */
      const kn_IN_GaganNeural: Voice;

      /**
       * Neural Microsoft voice, Kannada (India) Female, SapnaNeural.
       * @const
       */
      const kn_IN_SapnaNeural: Voice;

      /**
       * Neural Microsoft voice, Korean (Korea) Female, SunHiNeural.
       * @const
       */
      const ko_KR_SunHiNeural: Voice;

      /**
       * Neural Microsoft voice, Korean (Korea) Male, InJoonNeural.
       * @const
       */
      const ko_KR_InJoonNeural: Voice;

      /**
       * Neural Microsoft voice, Lao (Laos) Male, ChanthavongNeural.
       * @const
       */
      const lo_LA_ChanthavongNeural: Voice;

      /**
       * Neural Microsoft voice, Lao (Laos) Female, KeomanyNeural.
       * @const
       */
      const lo_LA_KeomanyNeural: Voice;

      /**
       * Neural Microsoft voice, Lithuanian (Lithuania) Male, LeonasNeural.
       * @const
       */
      const lt_LT_LeonasNeural: Voice;

      /**
       * Neural Microsoft voice, Lithuanian (Lithuania) Female, OnaNeural.
       * @const
       */
      const lt_LT_OnaNeural: Voice;

      /**
       * Neural Microsoft voice, Latvian (Latvia) Female, EveritaNeural.
       * @const
       */
      const lv_LV_EveritaNeural: Voice;

      /**
       * Neural Microsoft voice, Latvian (Latvia) Male, NilsNeural.
       * @const
       */
      const lv_LV_NilsNeural: Voice;

      /**
       * Neural Microsoft voice, Macedonian (North Macedonia) Male, AleksandarNeural.
       * @const
       */
      const mk_MK_AleksandarNeural: Voice;

      /**
       * Neural Microsoft voice, Macedonian (North Macedonia) Female, MarijaNeural.
       * @const
       */
      const mk_MK_MarijaNeural: Voice;

      /**
       * Neural Microsoft voice, Malayalam (India) Male, MidhunNeural.
       * @const
       */
      const ml_IN_MidhunNeural: Voice;

      /**
       * Neural Microsoft voice, Malayalam (India) Female, SobhanaNeural.
       * @const
       */
      const ml_IN_SobhanaNeural: Voice;

      /**
       * Neural Microsoft voice, Mongolian (Mongolia) Male, BataaNeural.
       * @const
       */
      const mn_MN_BataaNeural: Voice;

      /**
       * Neural Microsoft voice, Mongolian (Mongolia) Female, YesuiNeural.
       * @const
       */
      const mn_MN_YesuiNeural: Voice;

      /**
       * Neural Microsoft voice, Marathi (India) Female, AarohiNeural.
       * @const
       */
      const mr_IN_AarohiNeural: Voice;

      /**
       * Neural Microsoft voice, Marathi (India) Male, ManoharNeural.
       * @const
       */
      const mr_IN_ManoharNeural: Voice;

      /**
       * Neural Microsoft voice, Malay (Malaysia) Male, OsmanNeural.
       * @const
       */
      const ms_MY_OsmanNeural: Voice;

      /**
       * Neural Microsoft voice, Malay (Malaysia) Female, YasminNeural.
       * @const
       */
      const ms_MY_YasminNeural: Voice;

      /**
       * Neural Microsoft voice, Maltese (Malta) Female, GraceNeural.
       * @const
       */
      const mt_MT_GraceNeural: Voice;

      /**
       * Neural Microsoft voice, Maltese (Malta) Male, JosephNeural.
       * @const
       */
      const mt_MT_JosephNeural: Voice;

      /**
       * Neural Microsoft voice, Burmese (Myanmar) Female, NilarNeural.
       * @const
       */
      const my_MM_NilarNeural: Voice;

      /**
       * Neural Microsoft voice, Burmese (Myanmar) Male, ThihaNeural.
       * @const
       */
      const my_MM_ThihaNeural: Voice;

      /**
       * Neural Microsoft voice, Norwegian Bokmål (Norway) Female, PernilleNeural.
       * @const
       */
      const nb_NO_PernilleNeural: Voice;

      /**
       * Neural Microsoft voice, Norwegian Bokmål (Norway) Male, FinnNeural.
       * @const
       */
      const nb_NO_FinnNeural: Voice;

      /**
       * Neural Microsoft voice, Norwegian Bokmål (Norway) Female, IselinNeural.
       * @const
       */
      const nb_NO_IselinNeural: Voice;

      /**
       * Neural Microsoft voice, Nepali (Nepal) Female, HemkalaNeural.
       * @const
       */
      const ne_NP_HemkalaNeural: Voice;

      /**
       * Neural Microsoft voice, Nepali (Nepal) Male, SagarNeural.
       * @const
       */
      const ne_NP_SagarNeural: Voice;

      /**
       * Neural Microsoft voice, Dutch (Belgium) Male, ArnaudNeural.
       * @const
       */
      const nl_BE_ArnaudNeural: Voice;

      /**
       * Neural Microsoft voice, Dutch (Belgium) Female, DenaNeural.
       * @const
       */
      const nl_BE_DenaNeural: Voice;

      /**
       * Neural Microsoft voice, Dutch (Netherlands) Female, ColetteNeural.
       * @const
       */
      const nl_NL_ColetteNeural: Voice;

      /**
       * Neural Microsoft voice, Dutch (Netherlands) Female, FennaNeural.
       * @const
       */
      const nl_NL_FennaNeural: Voice;

      /**
       * Neural Microsoft voice, Dutch (Netherlands) Male, MaartenNeural.
       * @const
       */
      const nl_NL_MaartenNeural: Voice;

      /**
       * Neural Microsoft voice, Polish (Poland) Female, AgnieszkaNeural.
       * @const
       */
      const pl_PL_AgnieszkaNeural: Voice;

      /**
       * Neural Microsoft voice, Polish (Poland) Male, MarekNeural.
       * @const
       */
      const pl_PL_MarekNeural: Voice;

      /**
       * Neural Microsoft voice, Polish (Poland) Female, ZofiaNeural.
       * @const
       */
      const pl_PL_ZofiaNeural: Voice;

      /**
       * Neural Microsoft voice, Pashto (Afghanistan) Male, GulNawazNeural.
       * @const
       */
      const ps_AF_GulNawazNeural: Voice;

      /**
       * Neural Microsoft voice, Pashto (Afghanistan) Female, LatifaNeural.
       * @const
       */
      const ps_AF_LatifaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, FranciscaNeural.
       * @const
       */
      const pt_BR_FranciscaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, AntonioNeural.
       * @const
       */
      const pt_BR_AntonioNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, BrendaNeural.
       * @const
       */
      const pt_BR_BrendaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, DonatoNeural.
       * @const
       */
      const pt_BR_DonatoNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, ElzaNeural.
       * @const
       */
      const pt_BR_ElzaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, FabioNeural.
       * @const
       */
      const pt_BR_FabioNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, GiovannaNeural.
       * @const
       */
      const pt_BR_GiovannaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, HumbertoNeural.
       * @const
       */
      const pt_BR_HumbertoNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, JulioNeural.
       * @const
       */
      const pt_BR_JulioNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, LeilaNeural.
       * @const
       */
      const pt_BR_LeilaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, LeticiaNeural.
       * @const
       */
      const pt_BR_LeticiaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, ManuelaNeural.
       * @const
       */
      const pt_BR_ManuelaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, NicolauNeural.
       * @const
       */
      const pt_BR_NicolauNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Male, ValerioNeural.
       * @const
       */
      const pt_BR_ValerioNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Brazil) Female, YaraNeural.
       * @const
       */
      const pt_BR_YaraNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Portugal) Male, DuarteNeural.
       * @const
       */
      const pt_PT_DuarteNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Portugal) Female, FernandaNeural.
       * @const
       */
      const pt_PT_FernandaNeural: Voice;

      /**
       * Neural Microsoft voice, Portuguese (Portugal) Female, RaquelNeural.
       * @const
       */
      const pt_PT_RaquelNeural: Voice;

      /**
       * Neural Microsoft voice, Romanian (Romania) Female, AlinaNeural.
       * @const
       */
      const ro_RO_AlinaNeural: Voice;

      /**
       * Neural Microsoft voice, Romanian (Romania) Male, EmilNeural.
       * @const
       */
      const ro_RO_EmilNeural: Voice;

      /**
       * Neural Microsoft voice, Russian (Russia) Female, SvetlanaNeural.
       * @const
       */
      const ru_RU_SvetlanaNeural: Voice;

      /**
       * Neural Microsoft voice, Russian (Russia) Female, DariyaNeural.
       * @const
       */
      const ru_RU_DariyaNeural: Voice;

      /**
       * Neural Microsoft voice, Russian (Russia) Male, DmitryNeural.
       * @const
       */
      const ru_RU_DmitryNeural: Voice;

      /**
       * Neural Microsoft voice, Sinhala (Sri Lanka) Male, SameeraNeural.
       * @const
       */
      const si_LK_SameeraNeural: Voice;

      /**
       * Neural Microsoft voice, Sinhala (Sri Lanka) Female, ThiliniNeural.
       * @const
       */
      const si_LK_ThiliniNeural: Voice;

      /**
       * Neural Microsoft voice, Slovak (Slovakia) Male, LukasNeural.
       * @const
       */
      const sk_SK_LukasNeural: Voice;

      /**
       * Neural Microsoft voice, Slovak (Slovakia) Female, ViktoriaNeural.
       * @const
       */
      const sk_SK_ViktoriaNeural: Voice;

      /**
       * Neural Microsoft voice, Slovenian (Slovenia) Female, PetraNeural.
       * @const
       */
      const sl_SI_PetraNeural: Voice;

      /**
       * Neural Microsoft voice, Slovenian (Slovenia) Male, RokNeural.
       * @const
       */
      const sl_SI_RokNeural: Voice;

      /**
       * Neural Microsoft voice, Somali (Somalia) Male, MuuseNeural.
       * @const
       */
      const so_SO_MuuseNeural: Voice;

      /**
       * Neural Microsoft voice, Somali (Somalia) Female, UbaxNeural.
       * @const
       */
      const so_SO_UbaxNeural: Voice;

      /**
       * Neural Microsoft voice, Albanian (Albania) Female, AnilaNeural.
       * @const
       */
      const sq_AL_AnilaNeural: Voice;

      /**
       * Neural Microsoft voice, Albanian (Albania) Male, IlirNeural.
       * @const
       */
      const sq_AL_IlirNeural: Voice;

      /**
       * Neural Microsoft voice, Serbian (Cyrillic, Serbia) Male, NicholasNeural.
       * @const
       */
      const sr_RS_NicholasNeural: Voice;

      /**
       * Neural Microsoft voice, Serbian (Cyrillic, Serbia) Female, SophieNeural.
       * @const
       */
      const sr_RS_SophieNeural: Voice;

      /**
       * Neural Microsoft voice, Sundanese (Indonesia) Male, JajangNeural.
       * @const
       */
      const su_ID_JajangNeural: Voice;

      /**
       * Neural Microsoft voice, Sundanese (Indonesia) Female, TutiNeural.
       * @const
       */
      const su_ID_TutiNeural: Voice;

      /**
       * Neural Microsoft voice, Swedish (Sweden) Female, SofieNeural.
       * @const
       */
      const sv_SE_SofieNeural: Voice;

      /**
       * Neural Microsoft voice, Swedish (Sweden) Female, HilleviNeural.
       * @const
       */
      const sv_SE_HilleviNeural: Voice;

      /**
       * Neural Microsoft voice, Swedish (Sweden) Male, MattiasNeural.
       * @const
       */
      const sv_SE_MattiasNeural: Voice;

      /**
       * Neural Microsoft voice, Swahili (Kenya) Male, RafikiNeural.
       * @const
       */
      const sw_KE_RafikiNeural: Voice;

      /**
       * Neural Microsoft voice, Swahili (Kenya) Female, ZuriNeural.
       * @const
       */
      const sw_KE_ZuriNeural: Voice;

      /**
       * Neural Microsoft voice, Swahili (Tanzania) Male, DaudiNeural.
       * @const
       */
      const sw_TZ_DaudiNeural: Voice;

      /**
       * Neural Microsoft voice, Swahili (Tanzania) Female, RehemaNeural.
       * @const
       */
      const sw_TZ_RehemaNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (India) Female, PallaviNeural.
       * @const
       */
      const ta_IN_PallaviNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (India) Male, ValluvarNeural.
       * @const
       */
      const ta_IN_ValluvarNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (Sri Lanka) Male, KumarNeural.
       * @const
       */
      const ta_LK_KumarNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (Sri Lanka) Female, SaranyaNeural.
       * @const
       */
      const ta_LK_SaranyaNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (Malaysia) Female, KaniNeural.
       * @const
       */
      const ta_MY_KaniNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (Malaysia) Male, SuryaNeural.
       * @const
       */
      const ta_MY_SuryaNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (Singapore) Male, AnbuNeural.
       * @const
       */
      const ta_SG_AnbuNeural: Voice;

      /**
       * Neural Microsoft voice, Tamil (Singapore) Female, VenbaNeural.
       * @const
       */
      const ta_SG_VenbaNeural: Voice;

      /**
       * Neural Microsoft voice, Telugu (India) Male, MohanNeural.
       * @const
       */
      const te_IN_MohanNeural: Voice;

      /**
       * Neural Microsoft voice, Telugu (India) Female, ShrutiNeural.
       * @const
       */
      const te_IN_ShrutiNeural: Voice;

      /**
       * Neural Microsoft voice, Thai (Thailand) Female, PremwadeeNeural.
       * @const
       */
      const th_TH_PremwadeeNeural: Voice;

      /**
       * Neural Microsoft voice, Thai (Thailand) Female, AcharaNeural.
       * @const
       */
      const th_TH_AcharaNeural: Voice;

      /**
       * Neural Microsoft voice, Thai (Thailand) Male, NiwatNeural.
       * @const
       */
      const th_TH_NiwatNeural: Voice;

      /**
       * Neural Microsoft voice, Turkish (Turkey) Male, AhmetNeural.
       * @const
       */
      const tr_TR_AhmetNeural: Voice;

      /**
       * Neural Microsoft voice, Turkish (Turkey) Female, EmelNeural.
       * @const
       */
      const tr_TR_EmelNeural: Voice;

      /**
       * Neural Microsoft voice, Ukrainian (Ukraine) Male, OstapNeural.
       * @const
       */
      const uk_UA_OstapNeural: Voice;

      /**
       * Neural Microsoft voice, Ukrainian (Ukraine) Female, PolinaNeural.
       * @const
       */
      const uk_UA_PolinaNeural: Voice;

      /**
       * Neural Microsoft voice, Urdu (India) Female, GulNeural.
       * @const
       */
      const ur_IN_GulNeural: Voice;

      /**
       * Neural Microsoft voice, Urdu (India) Male, SalmanNeural.
       * @const
       */
      const ur_IN_SalmanNeural: Voice;

      /**
       * Neural Microsoft voice, Urdu (Pakistan) Male, AsadNeural.
       * @const
       */
      const ur_PK_AsadNeural: Voice;

      /**
       * Neural Microsoft voice, Urdu (Pakistan) Female, UzmaNeural.
       * @const
       */
      const ur_PK_UzmaNeural: Voice;

      /**
       * Neural Microsoft voice, Uzbek (Latin, Uzbekistan) Female, MadinaNeural.
       * @const
       */
      const uz_UZ_MadinaNeural: Voice;

      /**
       * Neural Microsoft voice, Uzbek (Latin, Uzbekistan) Male, SardorNeural.
       * @const
       */
      const uz_UZ_SardorNeural: Voice;

      /**
       * Neural Microsoft voice, Vietnamese (Vietnam) Female, HoaiMyNeural.
       * @const
       */
      const vi_VN_HoaiMyNeural: Voice;

      /**
       * Neural Microsoft voice, Vietnamese (Vietnam) Male, NamMinhNeural.
       * @const
       */
      const vi_VN_NamMinhNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoxiaoNeural.
       * @const
       */
      const zh_CN_XiaoxiaoNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunyangNeural.
       * @const
       */
      const zh_CN_YunyangNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaochenNeural.
       * @const
       */
      const zh_CN_XiaochenNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaohanNeural.
       * @const
       */
      const zh_CN_XiaohanNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaomengNeural.
       * @const
       */
      const zh_CN_XiaomengNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaomoNeural.
       * @const
       */
      const zh_CN_XiaomoNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoqiuNeural.
       * @const
       */
      const zh_CN_XiaoqiuNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoruiNeural.
       * @const
       */
      const zh_CN_XiaoruiNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoshuangNeural.
       * @const
       */
      const zh_CN_XiaoshuangNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoxuanNeural.
       * @const
       */
      const zh_CN_XiaoxuanNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyanNeural.
       * @const
       */
      const zh_CN_XiaoyanNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyiNeural.
       * @const
       */
      const zh_CN_XiaoyiNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyouNeural.
       * @const
       */
      const zh_CN_XiaoyouNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaozhenNeural.
       * @const
       */
      const zh_CN_XiaozhenNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunfengNeural.
       * @const
       */
      const zh_CN_YunfengNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunhaoNeural.
       * @const
       */
      const zh_CN_YunhaoNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunjianNeural.
       * @const
       */
      const zh_CN_YunjianNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunxiaNeural.
       * @const
       */
      const zh_CN_YunxiaNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunxiNeural.
       * @const
       */
      const zh_CN_YunxiNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunyeNeural.
       * @const
       */
      const zh_CN_YunyeNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunzeNeural.
       * @const
       */
      const zh_CN_YunzeNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Zhongyuan Mandarin Henan, Simplified) Male, henan.
       * @const
       */
      const zh_CN_henan_YundengNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Jilu Mandarin, Simplified) Male, shandong.
       * @const
       */
      const zh_CN_shandong_YunxiangNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Cantonese, Traditional) Female, HiuMaanNeural.
       * @const
       */
      const zh_HK_HiuMaanNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Cantonese, Traditional) Female, HiuGaaiNeural.
       * @const
       */
      const zh_HK_HiuGaaiNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Cantonese, Traditional) Male, WanLungNeural.
       * @const
       */
      const zh_HK_WanLungNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Taiwanese Mandarin, Traditional) Female, HsiaoChenNeural.
       * @const
       */
      const zh_TW_HsiaoChenNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Taiwanese Mandarin, Traditional) Female, HsiaoYuNeural.
       * @const
       */
      const zh_TW_HsiaoYuNeural: Voice;

      /**
       * Neural Microsoft voice, Chinese (Taiwanese Mandarin, Traditional) Male, YunJheNeural.
       * @const
       */
      const zh_TW_YunJheNeural: Voice;

      /**
       * Neural Microsoft voice, Zulu (South Africa) Female, ThandoNeural.
       * @const
       */
      const zu_ZA_ThandoNeural: Voice;

      /**
       * Neural Microsoft voice, Zulu (South Africa) Male, ThembaNeural.
       * @const
       */
      const zu_ZA_ThembaNeural: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of SaluteSpeech languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace SaluteSpeech {
    /**
     * SaluteSpeech voice, Russian female.
     * @const
     */
    const ru_RU_natalia: Voice;
    /**
     * SaluteSpeech voice, Russian male.
     * @const
     */
    const ru_RU_boris: Voice;
    /**
     * SaluteSpeech voice, Russian male.
     * @const
     */
    const ru_RU_marfa: Voice;
    /**
     * SaluteSpeech voice, Russian male.
     * @const
     */
    const ru_RU_taras: Voice;
    /**
     * SaluteSpeech voice, Russian female.
     * @const
     */
    const ru_RU_alexandra: Voice;
    /**
     * SaluteSpeech voice, Russian male.
     * @const
     */
    const ru_RU_sergey: Voice;
    /**
     * Creates a brand voice with SaluteSpeech. To use this method, please contact support.
     * @param name The name of the voice
     */
    function createBrandVoice(name: string): Voice;
  }
}

declare namespace VoiceList {
  /**
   * List of Tinkoff VoiceKit languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Tinkoff {
    /**
     * Tinkoff voice, Russian female.
     * @const
     */
    const ru_RU_Alyona: Voice;
    /**
     * Tinkoff voice, Russian female, sad.
     * @const
     */
    const ru_RU_Alyona_sad: Voice;
    /**
     * Tinkoff voice, Russian female, funny.
     * @const
     */
    const ru_RU_Alyona_funny: Voice;
    /**
     * Tinkoff voice, Russian female, flirt.
     * @const
     */
    const ru_RU_Alyona_flirt: Voice;
    /**
     * Tinkoff voice, Russian male, neutral.
     * @const
     */
    const ru_RU_Dorofeev_neutral: Voice;
    /**
     * Tinkoff voice, Russian male, drama.
     * @const
     */
    const ru_RU_Dorofeev_drama: Voice;
    /**
     * Tinkoff voice, Russian male, comedy.
     * @const
     */
    const ru_RU_Dorofeev_comedy: Voice;
    /**
     * Tinkoff voice, Russian male, info.
     * @const
     */
    const ru_RU_Dorofeev_info: Voice;
    /**
     * Tinkoff voice, Russian male, tragedy.
     * @const
     */
    const ru_RU_Dorofeev_tragedy: Voice;
  }
}

/**
 * List of available languages for the [Call.say] and [VoxEngine.createTTSPlayer](/docs/references/voxengine/voxengine/createTTSPlayer) methods.
 */
declare namespace VoiceList {}

declare namespace VoiceList {
  namespace Yandex {
    /**
     * Premium voices that sound more natural due to advanced synthesis technology.
     * @namespace
     */
    namespace Neural {
      /**
       * Neural Yandex voice, German female, Lea.
       * @const
       */
      const de_DE_lea: Voice;
      /**
       * Neural Yandex voice, English (US) male, John.
       * @const
       */
      const en_US_john: Voice;
      /**
       * Yandex voice, Kazakh (Kazakhstan) male, Amira.
       * @const
       */
      const kk_KK_amira: Voice;
      /**
       * Yandex voice, Kazakh (Kazakhstan) male, Madi.
       * @const
       */
      const kk_KK_madi: Voice;
      /**
       * Neural Yandex voice, Russian female, Alena.
       * @const
       */
      const ru_RU_alena: Voice;
      /**
       * Yandex voice, Russian male, Ermil.
       * @const
       */
      const ru_RU_ermil: Voice;
      /**
       * Neural Yandex voice, Russian male, Filipp.
       * @const
       */
      const ru_RU_filipp: Voice;
      /**
       * Yandex voice, Russian female, Jane.
       * @const
       */
      const ru_RU_jane: Voice;
      /**
       * Yandex voice, Russian male, Madirus.
       * @const
       */
      const ru_RU_madirus: Voice;
      /**
       * Yandex voice, Russian female, Omazh.
       * @const
       */
      const ru_RU_omazh: Voice;
      /**
       * Yandex voice, Russian male, Zahar.
       * @const
       */
      const ru_RU_zahar: Voice;
      /**
       * Yandex voice, Uzbek (Uzbekistan) female, Nigora.
       * @const
       */
      const uz_UZ_nigora: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of Yandex SpeechKit languages. Depending on the language, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Yandex {
  }
}

declare type Voice = {
  provider?: string;
  voice?: string;
  language: string;
};

declare namespace VoxEngine {
  /**
   * Adds a handler for the specified [AppEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [AppEvents.Started])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  function addEventListener<T extends keyof _AppEvents>(
    event: AppEvents | T,
    callback: (ev: _AppEvents[T]) => any
  ): void;
}

declare namespace VoxEngine {
  /**
   * Allows accepting inbound connections to ensure WebSocket bidirectional exchange.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.WebSocket);
   * ```
   */
  function allowWebSocketConnections(): void;
}

declare namespace VoxEngine {
  interface AnswerParameters extends CallParameters {}
}

declare namespace VoxEngine {
  /**
   * Base recorder parameters. For INTERNAL usage ONLY.
   * @private
   */
  interface BaseRecorderParameters {
    /**
     * Whether to restrict access to the record without management API authorization (available only in [VoxEngine.createRecorder]).
     */
    secure?: boolean;
    /**
     * Whether to create the call record transcription. Note that transcription is not available for the Recorder module. See the details in the article.
     */
    transcribe?: boolean;
    /**
     * Transcription language. The parameter uses [ASRLanguage] from the ASR Module as possible values. Note that it is necessary to include the ASR module in the scenario to use the language constants. The parameter is not available for the Recorder module.
     */
    language?: ASRLanguage;
    /**
     * Whether to use the HD audio. If set to false (default), 8 KHz / 32 kbps mp3 file is generated. Otherwise, "wideband audio" 48 KHz / 192 kbps mp3 file is generated. Note that transcription's quality does not depend on this parameter. The property is not compatible with lossless: true property.
     */
    hd_audio?: boolean;
    /**
     * Storage time for recorded files. The default value is 3 months; see possible values in the [Voxengine.RecordExpireTime](/docs/references/voxengine/voxengine/RecordExpireTime) list.
     */
    expire?: RecordExpireTime;
    /**
     * Whether to save the record in flac format. The default value is false. The property is not compatible with hd_audio: true property.
     */
    lossless?: boolean;
    /**
     * Whether to record video. The default value is false. For video recording use the Call.record ({video: true}) method call. The parameter is not available for the Recorder module because it could only record an audio.
     */
    video?: boolean;
    /**
     * The prefix to add to the record names when storing to your S3 storage.
     */
    recordNamePrefix?: string;
  }
}

declare namespace VoxEngine {
  /**
   * Makes a call to a conference via Conference module. If there is no such conference, it is created in the first method's call. The method is designed to be called in a simple inbound scenario, then it can trigger another special scenario which contains logic of the conference.
   * The method can trigger the Failed event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param conferenceId ID of the conference. The parameter has to be the same as the pattern in the rule so the method triggers appropriate rule with conference logic.
   * @param callerid CallerID of the caller that is displayed to the user. Spaces usage is not allowed. Normally it is some phone number that can be used for callback. IMPORTANT: you cannot use test numbers rented from Voximplant as CallerID, use only real numbers.
   * @param displayName Name of the caller that is displayed to the user. Normally it is a human-readable version of CallerID, e.g. a person's name.
   * @param headers Optional SIP headers to be passed with a call to conference. Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   * @param scheme Internal information about codecs from the [AppEvents.CallAlerting] event.
   */
  function callConference(
    conferenceId: string,
    callerid: string,
    displayName: string,
    headers?: { [header: string]: string },
    scheme?: string
  ): Call;
}

declare namespace VoxEngine {
  /**
   * @private
   */
  interface CallParameters {
    /**
     * Name of the caller that is displayed to the user. Normally it is a human-readable version of CallerID, e.g. a person's name
     */
    displayName?: string;
    /**
     * Internal information about codecs from the [AppEvents.CallAlerting] event
     */
    scheme?: { [id: string]: any };
    /**
     * Sets the maximum possible video bitrate for the customer device in kbps
     */
    maxVideoBitrate?: number;
    /**
     * Whether to disable the RTP header extension for transmission offset if provided
     */
    disableExtVideoOffset?: boolean;
    /**
     * Whether to disable the RTP header extension for video orientation, `3gpp:video-orientation`, if provided. Browsers that do not support that extension display the video correctly, however, the battery consumption is higher
     */
    disableExtVideoOrientation?: boolean;
    /**
     * Whether to disable the RTP header extension to control playout delay if provided
     */
    disableExtPlayoutDelay?: boolean;
    /**
     * Whether to disable the RTP header extension for video timing if provided
     */
    disableExtVideoTiming?: boolean;
    /**
     * Whether the call is coming from a conference. The default value is false
     */
    conferenceCall?: boolean;
  }
}

declare namespace VoxEngine {
  /**
   * VoxEngine.callPSTN parameters
   */
  interface CallPSTNParameters {
    /**
     * Answering machine or voicemail detector.
     */
    amd?: AMD.AnsweringMachineDetector;
  }
}

declare namespace VoxEngine {
  /**
   * Starts an outbound call to the specified phone number. Calls that are more expensive than 20 cents per minute and calls to Africa are blocked by default for security reasons.
   * The method can trigger the CallEvents.Failed event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param number phone number to start a call to in the international format (E.164)
   * @param callerid CallerID of the caller that is displayed to the user. Spaces usage is not allowed. A valid phone number that can be used to call back is required. Following phone numbers can be used:
   * * A real phone number that is [rented](https://manage.voximplant.com/numbers/my_numbers) from Voximplant. **IMPORTANT**: test numbers cannot be used.
   * * Any phone number that is [verified](https://manage.voximplant.com/settings/caller_ids) via an automated call from Voximplant and confirmation code.
   * * A phone number from an inbound call to the rented number. It can be retrieved as [Caller ID](/docs/references/voxengine/call#callerid).
   * @param parameters Object with callPSTN parameters.
   */
  function callPSTN(
    number: string,
    callerid: string,
    parameters?: VoxEngine.CallPSTNParameters
  ): Call;
}

declare namespace VoxEngine {
  /**
   * Recorder parameters. The parameters can be passed as arguments to the [Call.record] method.
   */
  interface CallRecordParameters extends BaseRecorderParameters {
    /**
     * Whether the sound is stereo. The default value is false. The parameter does not change anything for the Recorder module: it records stereo with mixed streams in both channels. For the [Call.record] method it works in another way:  1) if it is False, it records stereo with mixed streams in both channels  2) If it is True, the Audio stream from a call endpoint to voximplant cloud is recorded into right channel. Audio stream from voximplant cloud to a call endpoint is recorded into left channel.
     */
    stereo?: boolean;
    /**
     * Transcription dictionary. Array of words that are possible values. Note that dict does not limit the transcription to the specific list. Instead, words in the specified list have a higher chance to be selected. Note that the parameter does not affect the Recorder module because the transcription is not available for it.
     */
    dict?: ASRDictionary | string[];
    /**
     * An array of two strings. Each string names the label in resulting transcription: the first string names a call/stream that initiated recording, the second string names the other call. If there is only one string in the array or the parameter is not specified at all, the recording's initiate call has the "Left" name and the second stream has the "Right" name. The parameter requires the 'transcribe: true' parameter. The parameter is not available for the Recorder module.
     */
    labels?: string[];
    /**
     * Transcription provider.
     */
    provider?:
      | TranscriptionProvider.GOOGLE
      | TranscriptionProvider.TINKOFF
      | TranscriptionProvider.YANDEX;
    /**
     * Transcription format. Could be specified as "json". In that case the transcription result is saved in JSON format. The parameter is not available for the Recorder module.
     */
    format?: string;
  }
}

declare namespace VoxEngine {
  /**
   * VoxEngine.callSIP parameters
   */
  interface CallSIPParameters {
    /**
     * CallerID of the caller that is displayed to the callee. Usage of whitespaces is not allowed. Normally it is a phone number that can be used for callback.
     */
    callerid: string;
    /**
     * Name of the caller that is displayed to the callee. Normally it is a human-readable version of CallerID, e.g. a person's name.
     */
    displayName: string;
    /**
     * Password for SIP authentication.
     */
    password: string;
    /**
     * Username for SIP authentication. If not specified, callerid is used as the username for authentication.
     */
    authUser: string;
    /**
     * Optional custom parameters (SIP headers) that should be passed with a call (INVITE) message.
     * Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK
     * (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
     */
    headers: object;
    /**
     * Whether the call has video support. Please note that the price for audio-only and video calls is different!
     */
    video: boolean;
    /**
     * Outbound proxy, e.g. outProxy: "69.167.178.6"
     */
    outProxy: string;
    /**
     * Identifier of Voximplant SIP registration that is used for outbound call.
     */
    regId: number;
    /**
     * Answering machine or voicemail detector.
     */
    amd?: AMD.AnsweringMachineDetector;
  }
}

declare namespace VoxEngine {
  /**
   * Starts an outbound call to the external SIP system or to another user of the same application. Supported codecs are: [G.722](https://www.itu.int/rec/T-REC-G.722), [G.711 (u-law and a-law)](https://www.itu.int/rec/T-REC-G.711), [Opus](http://opus-codec.org/), [ILBC](https://webrtc.org/license/ilbc-freeware/), [H.264](https://www.itu.int/rec/T-REC-H.264), [VP8](https://tools.ietf.org/html/rfc6386). The method can trigger the [CallEvents.Failed] event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param to SIP URI to make a call to. Example of an external call: **sip:alice@example.org**. Examples with TLS usage: **sips:alice@example.org:5061** ; **alice@example.org:5061;transport=tls**. The format for calls to another user of the same Voximplant application: user-of-the-application@application.account.voximplant.com
   * @param parameters Object with callSIP parameters. Note that if this parameter is not an object, it is treated as "callerid". Further parameters are treated as "displayName", "password", "authUser", "extraHeaders", "video", "outProxy" respectively.
   * @param scheme Internal information about codecs from the AppEvents.CallAlerting event.
   */
  function callSIP(to: string, parameters: VoxEngine.CallSIPParameters): Call;
}

declare namespace VoxEngine {
  /**
   * Parameters for the VoxEngine.callUserDirect method
   */
  interface CallUserDirectParameters {
    /**
     * CallerID to display to the callee. Usage of whitespaces is not allowed. Normally it is a phone number that can be used for callback. IMPORTANT: test numbers rented from Voximplant cannot be used as CallerIDs, use only real numbers.
     */
    callerid: string;
    /**
     * Name of the caller that is displayed to the callee. Normally it is a human-readable version of CallerID, e.g. a person's name.
     */
    displayName: string;
    /**
     * Send custom tags along with the push notification of an inbound call.
     */
    analyticsLabel: string;
    /**
     * Optional custom parameters (SIP headers) to be passed with a call (INVITE) message. Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
     */
    extraHeaders?: { [header: string]: string };
  }
}

declare namespace VoxEngine {
  /**
   * Start an outbound call to the specified Voximplant user in peer-to-peer mode.
   * The JavaScript scenario with this method and the destination user should be both within the same Voximplant application.
   * Audio playback and recording does not work. P2P mode is available only for calls between SDKs.
   * The method can trigger the CallEvents.Failed event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details. **IMPORTANT**: calling this method makes impossible to use the non-P2P mode for a new call and specified inboundCall.
   * So the following methods cannot be used: [Call.say], [Call.sendDigits], [Call.sendMediaTo], [Call.stopMediaTo].
   * @param incomingCall Inbound call that needs to be forwarded
   * @param username Name of the Voximplant user to call
   * @param parameters Object with callUserDirect parameters ("callerid", "displayName", "analyticsLabel" and "extraHeaders")
   */
  function callUserDirect(
    incomingCall: Call,
    username: string,
    parameters: VoxEngine.CallUserDirectParameters
  ): Call;
}

declare namespace VoxEngine {
  interface CallUserParameters extends CallParameters {
    /**
     * Name of the Voximplant user to call
     */
    username: string;
    /**
     * CallerID to display to the callee. Usage of whitespaces is not allowed. Normally it is a phone number that can be used for callback. IMPORTANT: test numbers rented from Voximplant cannot be used as CallerID, use only real numbers.
     */
    callerid: string;
    /**
     * Optional custom parameters (SIP headers) that should be passed with a call (INVITE) message. Custom header names have to begin with the 'X-' prefix except the 'VI-CallTimeout': '60' which hangs up if there is no answer after the timeout (in seconds, minimum value: 10, maximum value: 400, default value: 60). The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
     */
    extraHeaders?: { [header: string]: string };
    /**
     * Whether the call has video support. Optional. Please note that prices for audio-only and video calls are different!
     */
    video?: boolean;
    /**
     * Whether to send an RTP extension header to communicate video orientation information (`a=extmap:12 urn:3gpp:video-orientation`). If false, browsers that do not support that extension are correctly displaying video; however, the battery consumption is higher. The default value is true.
     */
    videoOrientationExtension?: boolean;
    /**
     * Sends custom tags along with the push notification of an inbound call.
     */
    analyticsLabel?: string;
    /**
     * Answering machine or voicemail detector.
     */
    amd?: AMD.AnsweringMachineDetector;
  }
}

declare namespace VoxEngine {
  /**
   * Starts an outbound call to the specified Voximplant user. The JavaScript scenario that uses this method and user being called should be both associated with the same Voximplant application.
   * The method can trigger the CallEvents.Failed event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param parameters Object with callUser parameters.
   */
  function callUser(parameters: VoxEngine.CallUserParameters): Call;
}

declare namespace VoxEngine {
  /**
   * Parameters object for the callConference method
   */
  interface ConferenceParameters {
    /**
     * Whether the audio is high definition. If set to false (default), audio stream has the frequency of 8 KHz. Otherwise, audio stream has the frequency of 48 KHz. Please note that default audio mode costs nothing while the high definition audio is billed additionally - for more details see the pricing page
     */
    hd_audio: boolean;
  }
}

declare namespace VoxEngine {
  /**
   * [ConferenceRecorder] parameters. The parameters can be passed as arguments to the [VoxEngine.createRecorder] method.
   */
  interface ConferenceRecorderParameters extends BaseRecorderParameters {
    /**
     * Video options for [ConferenceRecorder] parameters.
     */
    videoopt: VideoOpt;
  }
}

declare namespace VoxEngine {
  /**
   * Creates a new speech recognizer and starts recognition. Sources can later be attached via the [Call.sendMediaTo] method etc.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.ASR);
   * ```
   * @param param ASR parameters. IMPORTANT: the **profile** parameter is required, the other parameters are optional.
   */
  function createASR(param: ASRParameters): ASR;
}

declare namespace VoxEngine {
  /**
   * Creates a new conference.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.Conference);
   * ```
   * @param params
   */
  function createConference(params: ConferenceParameters): Conference;
}

declare namespace VoxEngine {
  /**
   * Creates a new audio recorder. Sources can later be attached via the [Call.sendMediaTo] method.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.Recorder);
   * ```
   * @param options Recorder parameters. Note that if the first parameter is not an object, it is treated as 'name', with second optional parameter as 'secure' boolean flag, default to 'false'.
   */
  function createRecorder(options?: VoxEngine.RecorderParameters): Recorder | ConferenceRecorder;
}

declare namespace VoxEngine {
  /**
   * Creates a streaming object. Sources can later be attached via the [Call.sendMediaTo] method.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.StreamingAgent);
   * ```
   * @param options Object with streaming parameters.
   */
  function createStreamingAgent(options: StreamingAgentSettings): StreamingAgent;
}

declare namespace VoxEngine {
  /**
   * Creates a new audio player with the specified [ToneScript](https://en.wikipedia.org/wiki/ToneScript) sequence. Media streams can later be attached via the [Call.sendMediaTo] method etc.
   * @param script ToneScript string
   * @param toneScriptPlayerOptions Parameters for ToneScript: loop, progressivePlayback, etc.
   **/
  function createToneScriptPlayer(
    script: string,
    toneScriptPlayerOptions: VoxEngine.ToneScriptPlayerOptions
  ): Player;
}

declare namespace VoxEngine {
  /**
   * Creates a new audio player with specified text; TTS is used to play this text. Media streams can later be attached via the [Call.sendMediaTo]  method etc.
   * If the text length exceeds 1500 characters, the [PlayerEvents.PlaybackFinished] event is triggered with error description. After the very first playing, a phrase is cached; each createTTSPlayer instance stores the cache data up to 2 weeks. Note that cache addresses only the URL, without additional headers. The cached phrase is available for all applications and further sessions.
   * @param text Text to synthesize
   * @param ttsPlayerOptions Parameters for TTS: language, progressive playback, volume, rate, etc.
   **/
  function createTTSPlayer(text: string, ttsPlayerOptions: VoxEngine.TTSPlayerOptions): Player;
}

declare namespace VoxEngine {
  /**
   * Creates a new audio player with specified audio file URL.
   *
   * After the very first playback, a file is cached; each
   * 'createURLPlayer' instance stores the cache data up to 2 weeks.
   * Note that cache addresses only the URL, without additional headers.
   * The cached file is available for all applications and further sessions.
   *
   * File download has a timeout of 12 seconds. Reaching this timeout causes the "Timeout is reached" error.
   *
   * Media streams can later be attached via the [Call.sendMediaTo]
   * method etc. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new inbound stream always replaces the previous one.
   * @param url Url of an audio file. Supported formats are: mp3, ogg & flac (mp3, speex, vorbis and flac codecs respectively). Maximum file size is 10 Mb.
   * @param urlPlayerOptions Optional parameters: progressive playback, loop, onPause, etc.
   **/
  function createURLPlayer(url: string, urlPlayerOptions?: VoxEngine.URLPlayerOptions): Player;
}

declare namespace VoxEngine {
  /**
   * Creates a WebSocket object. Sources can later be attached via the [Call.sendMediaTo] method.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.WebSocket);
   * ```
   * @param url URL to which to connect (wss:// + domain + path).
   * @param protocols Either a single protocol string or an array of protocol strings. The default value is 'chat'.
   */
  function createWebSocket(url: string, protocols: string | string[]): WebSocket;
}

declare namespace VoxEngine {
  /**
   * Set or get custom string associated with current JavaScript session.
   * There are two kinds of the customData values: one is for JavaScript session (i.e., VoxEngine object), another is for the particular call (i.e., Call.customData and web SDK parameter of the method).
   * It is possible to use them at the same time because they are independent entities. Remember that if you receive some value from web SDK, it does not overwrite the VoxEngine's value. Any of customData's type values can be later obtained from call history via management API or control panel.
   * @param cData Custom session data to set. Maximum size is 200 bytes.
   */
  function customData(cData?: string): string | undefined;
}

declare namespace VoxEngine {
  /**
   * Destroys an existing conference.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.Conference);
   * ```
   * @param conf
   */
  function destroyConference(conf: Conference): void;
}

declare namespace VoxEngine {
  /**
   * The DTMF type.
   */
  enum DTMFType {
    /**
     * All types of DTMF tones trigger the CallEvents.ToneReceived event: in-band , RFC 2833 and SIP INFO. Receiving a RFC 2833 tone disables processing of in-band tones to avoid duplicating
     */
    ALL,
    /**
     * Only RFC 2833 DTMF tones trigger the CallEvents.ToneReceived event
     */
    TELEPHONE_EVENT,
    /**
     * Only in-band DTMF tones trigger the CallEvents.ToneReceived event
     */
    IN_BAND,
    /**
     * Only SIP INFO DTMF tones trigger the CallEvents.ToneReceived event
     */
    SIP_INFO,
  }
}

declare namespace VoxEngine {
  /**
   * Adds all default event listeners to pass signaling information between two calls. The source code of the method is available on [GitHub](https://github.com/voximplant/easyprocess).
   * @param call1 Inbound alerting call
   * @param call2 Newly created outbound call
   * @param onEstablishedCallback Function to be called once the call is established. Both call1 and call2 are passed to this function as parameters
   * @param direct Whether the call is in the P2P mode. It is The default value is false.
   */
  function easyProcess(
    call1: Call,
    call2: Call,
    onEstablishedCallback?: (call1: Call, call2: Call) => void,
    direct?: boolean
  ): void;
}

declare namespace VoxEngine {
  /**
   * Adds a new request to the specified queue. The request is dispatched to the free agent according to the agent's status (must be "Ready") and skills.
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.ACD);
   * ```
   * @param queueName The name of the queue, to where the call is directed. Queue name must be specified exactly as in the control panel
   * @param callerid ID of the caller which is put to the queue. After request is dispatched to the agent, it is possible to get this ID by assigning a handler to the ACDEvents.OperatorReached event. The call is stored in the operatorCall property, so you can use the Call.callerid() method. IMPORTANT: virtual numbers rented from Voximplant cannot be used as CallerID, use only real numbers.
   * @param params Object with extra parameters.
   */
  function enqueueACDRequest(
    queueName: string,
    callerid: string,
    params?: ACDEnqueueParams
  ): ACDRequest;
}

declare namespace VoxEngine {
  /**
   * Puts the task to a queue
   */
  function enqueueTask(settings: SmartQueueTaskSettings): SmartQueueTask;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an inbound call to PSTN. The method handles numbers only in the E.164 format by default. If you need to handle a number in another format, pass an additional function (as a parameter) to the method. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param numberTransform Optional function used to transform dialed number to international format. This function accepts dialed number and returns phone number in E.164 format
   * @param onEstablishedCallback Optional function that is invoked after a call is established. Both calls (inbound and outbound) are passed to this function
   * @param options An object with a number used as the callerid that is displayed to the callee. Whitespaces are not allowed. A valid phone number that can be used to call back if required.
   */
  function forwardCallToPSTN(
    numberTransform?: (number: string) => string,
    onEstablishedCallback?: (call1: Call, call2: Call) => void,
    options?: { callerid: string }
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an inbound call to a dialed SIP URI. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param onEstablishedCallback Optional function that is invoked after call is established. Both calls (inbound and outbound) are passed to this function
   * @param video Whether the call has video support. Please note that the price for audio-only and video calls is different!
   */
  function forwardCallToSIP(
    onEstablishedCallback?: (call1: Call, call2: Call) => void,
    video?: boolean
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an inbound call to a user of the current application in the P2P mode. Dialed number is considered as username. Due to the P2P mode, media player and recording do not work. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param onEstablishedCallback Optional function that is invoked after call is established. Both calls (inbound and outbound) are passed to this function
   */
  function forwardCallToUserDirect(
    onEstablishedCallback?: (call1: Call, call2: Call) => void
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an inbound call to a user of the current application. Dialed number is considered as username. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param onEstablishedCallback Optional function that is invoked after call is established. Both calls (inbound and outbound) are passed to this function
   * @param video Whether the call has video support. Please note that the price for audio-only and video calls is different!
   */
  function forwardCallToUser(
    onEstablishedCallback?: (call1: Call, call2: Call) => void,
    video?: boolean
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to play sound to inbound call. It terminates a call in three cases:
   * 1) playback is finished
   * 2) call failed
   * 3) call disconnected
   * @param fileURL URL of audio (mp3) file to play
   */
  function playSoundAndHangup(fileURL: string): void;
}

declare namespace VoxEngine {
  /**
   * List of available values for the [RecorderParameters.expire](/docs/references/voxengine/voxengine/recorderparameters#expire) parameter.
   */
  enum RecordExpireTime {
    DEFAULT = '',
    SIXMONTHS = '-6m',
    ONEYEAR = '-1y',
    TWOYEARS = '-2y',
    THREEYEARS = '-3y',
  }
}

declare namespace VoxEngine {
  /**
   * [Recorder] parameters. The parameters can be passed as arguments to the [VoxEngine.createRecorder] method.
   */
  interface RecorderParameters extends ConferenceRecorderParameters {
    /**
     * Name of the recorder for the call history.
     */
    name?: string;
    /**
     * Speech recognition provider.
     */
    provider?:
      | ASRProfileList.Amazon
      | ASRProfileList.Deepgram
      | ASRProfileList.Google
      | ASRProfileList.Microsoft
      | ASRProfileList.SaluteSpeech
      | ASRProfileList.Tinkoff
      | ASRProfileList.Yandex
      | ASRProfileList.YandexV3;
  }
}

declare namespace VoxEngine {
  /**
   * Removes a handler for the specified [AppEvents] event
   * @param event Event class (i.e., [AppEvents.Started])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  function removeEventListener<T extends keyof _AppEvents>(
    event: AppEvents | T,
    callback?: (ev: _AppEvents[T]) => any
  ): void;
}

declare namespace VoxEngine {
  /**
   * Options of the [Call.say] method.
   */
  interface SayOptions {
    /**
     * Language and voice for TTS. Lists of all supported languages: [VoiceList.Amazon], [VoiceList.Google], [VoiceList.IBM], [VoiceList.Microsoft], [VoiceList.SaluteSpeech], [VoiceList.Tinkoff], [VoiceList.Yandex], and [VoiceList.Default]. The default value is **VoiceList.Amazon.en_US_Joanna**.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
     */
    language?: Voice;
    /**
     * Whether to use progressive playback. If true, the generated speech is delivered in chunks which reduces delay before a method call and playback. The default value is false.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
     */
    progressivePlayback?: boolean;
    /**
     * Optional parameters for TTS. Note that support of the [VoxEngine.TTSOptions.pitch] parameter depends on the language and dictionary used. For unsupported combinations the [CallEvents.PlaybackFinished] event is triggered with error 400.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
     */
    ttsOptions?: VoxEngine.TTSOptions;
    /**
     * Provide the TTS parameters directly to the provider in this parameter. Find more information in the <a href="https://voximplant.com/docs/guides/speech/tts#passing-parameters-directly-to-the-provider">documentation</a>.<br><br>*Available for providers: Google, SaluteSpeech, Tinkoff, YandexV3.*
     */
    request?: Object;
  }
}

declare namespace VoxEngine {
  /**
   * Start sending media between mediaUnit1 and mediaUnit2. This method binds two audio/video streams.
   * @param mediaUnit1 First media unit
   * @param mediaUnit2 Second media unit
   */
  function sendMediaBetween(mediaUnit1: VoxMediaUnit, mediaUnit2: VoxMediaUnit): void;
}

declare namespace VoxEngine {
  /**
   * Options for the [Call.startPlayback] method.
   */
  interface StartPlaybackOptions {
    /*l
     * Whether to loop playback.
     */
    loop?: boolean;
    /**
     * Whether to use progressive playback. If true, the file is delivered in chunks which reduces delay before a method call and playback. The default value is false.
     */
    progressivePlayback?: boolean;
  }
}

declare namespace VoxEngine {
  /**
   * Stop sending media between mediaUnit1 and mediaUnit2.
   * @param mediaUnit1 First media unit
   * @param mediaUnit2 Second media unit
   */
  function stopMediaBetween(mediaUnit1: VoxMediaUnit, mediaUnit2: VoxMediaUnit): void;
}

declare namespace VoxEngine {
  /**
   * Terminates the current JavaScript session. All audio/video streams are disconnected and scenario execution stops. Note that after this function, only the [AppEvents.Terminating] and [AppEvents.Terminated] events are triggered.
   */
  function terminate(): void;
}

declare namespace VoxEngine {
  /**
   * Options for the [VoxEngine.createToneScriptPlayer] method.
   */
  interface ToneScriptPlayerOptions {
    /**
     * Whether to loop playback.
     */
    loop?: boolean;
    /**
     * Whether to use progressive playback or not. If true, the generated tone is delivered in chunks which reduces delay before a method call and playback. The default value is false.
     */
    progressivePlayback?: boolean;
  }
}

declare namespace VoxEngine {
  enum TTSEffectsProfile {
    /**
     * Smart watches and other wearables, like Apple Watch, Wear OS watch
     */
    WearableClassDevice = 'wearable-class-device',
    /**
     * Smartphones, like Google Pixel, Samsung Galaxy, Apple iPhone
     */
    HandsetClassDevice = 'handset-class-device',
    /**
     * Earbuds or headphones for audio playback, like Sennheiser headphones
     */
    HeadphoneClassDevice = 'headphone-class-device',
    /**
     * Small home speakers, like Google Home Mini
     */
    SmallBluetoothSpeakerClassDevice = 'small-bluetooth-speaker-class-device',
    /**
     * Smart home speakers, like Google Home
     */
    MediumBluetoothSpeakerClassDevice = 'medium-bluetooth-speaker-class-device',
    /**
     * Home entertainment systems or smart TVs, like Google Home Max, LG TV
     */
    LargeHomeEntertainmentClassDevice = 'large-home-entertainment-class-device',
    /**
     * Car speakers, home theaters
     */
    LargeAutomotiveClassDevice = 'large-automotive-class-device',
    /**
     * Interactive Voice Response (IVR) systems
     */
    TelephonyClassApplication = 'telephony-class-application',
  }
}

declare namespace VoxEngine {
  /**
   * Options for text-to-speech. See the details in the <a href="//www.w3.org/TR/speech-synthesis/#S3.2.4">official specs</a>.
   */
  interface TTSOptions {
    /**
     * Voice sentiment. For Yandex voices, works only for <a href="https://voximplant.com/docs/references/voxengine/voicelist/yandex/neural">ru_RU voices</a>.<br><br>*Available for providers: Yandex.*
     */
    emotion?: string;
    /**
     * Voice pitch. Acceptable ranges: 1) the numbers followed by "Hz" from 0.5Hz to 2Hz  2) x-low, low, medium, high, x-high, default<br><br>*Available for providers: Google.*
     */
    pitch?: string;
    /**
     * Speech speed. Possible values are x-slow, slow, medium, fast, x-fast, default.<br><br>*Available for providers: Google, Yandex.*
     */
    rate?: string;
    /**
     * Speech volume. Possible values are silent, x-soft, soft, medium, loud, x-loud, default.<br><br>*Available for providers: Google.*
     */
    volume?: string;
    /**
     * An identifier which selects 'audio effects' profiles that are applied on (post synthesized) text to speech. Effects are applied additionally to each other in the order they are provided.<br><br>*Available for providers: Google.*
     */
    effectsProfileId?: VoxEngine.TTSEffectsProfile[];
    /**
     * If you have a custom Yandex engine voice, specify it in this field. Please contact support to activate this feature for your account.<br><br>*Available for providers: Yandex.*
     */
    yandexCustomModelName?: string;
  }
}

declare namespace VoxEngine {
  /**
   * Options for the [VoxEngine.createTTSPlayer] method.
   */
  interface TTSPlayerOptions {
    /**
     * Language and voice. Lists of all supported languages: [VoiceList.Amazon], [VoiceList.Google], [VoiceList.IBM], [VoiceList.Microsoft], [VoiceList.SaluteSpeech], [VoiceList.Tinkoff], [VoiceList.Yandex] and [VoiceList.Default]. The default value is **VoiceList.Amazon.en_US_Joanna**.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
     */
    language?: Voice;
    /**
     * Whether to use progressive playback or not. If true, the generated speech is delivered in chunks which reduces delay before a method call and playback. The default value is false.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
     */
    progressivePlayback?: boolean;
    /**
     * Optional parameters for TTS. Note that support of the [VoxEngine.TTSOptions.pitch] parameter depends on the language and dictionary used. For unsupported combinations the [CallEvents.PlaybackFinished] event is triggered with error 400.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, Tinkoff, Yandex.*
     */
    ttsOptions?: VoxEngine.TTSOptions;
    /**
     * Whether the player is on pause after creation. To continue the playback, use the [Player.resume] method. The default value is false.
     */
    onPause?: boolean;
    /**
     * Provide the TTS parameters directly to the provider in this parameter. Find more information in the <a href="https://voximplant.com/docs/guides/speech/tts#passing-parameters-directly-to-the-provider"> documentation</a>.<br><br>*Available for providers: Google, SaluteSpeech, Tinkoff, YandexV3.*
     */
    request?: Object;
  }
}

declare namespace VoxEngine {
  /**
   * Updates the current video recorder options.
   */
  interface UpdateVideoOpt {
    /**
     * Video layout settings. If set to 'grid', all the video frames are the same size. If set to 'tribune', one active video frame is bigger than the others. If set to 'custom', you need to provide a layoutSettings option with an object specifying custom layout settings.
     */
    layout?: 'grid' | 'tribune' | 'custom';
    /**
     * If layout is set to custom, specifies custom video layout settings.
     */
    layoutSettings?: VoxTilerDrawArea[];
    /**
     * If layout is set to tribune, specifies which frame is bigger than the others. Set to 'vad' if you want the bigger frame to change to the speaking participant, or specify the participant's ID to show one person constantly.
     */
    layoutPriority?: 'vad' | string[];
    /**
     * Whether to show the participants' names on their video frames.
     */
    labels?: boolean;
    /**
     * Whether to highlight video frame of the speaking participant.
     */
    vad?: boolean;
    /**
     * HTML color code for the video file background.
     */
    background?: string;
    /**
     * Video frames' direction, left to right or right to left.
     */
    direction?: 'ltr' | 'rtl';
    /**
     * How to fill a participant's video source to the conference frame.
     */
    objectFit?: 'fill' | 'contain' | 'cover' | 'none';
    /**
     * A container to store custom data for the current recorder.
     */
    customData?: any;
  }
}

declare namespace VoxEngine {
  /**
   * Options for the [VoxEngine.createURLPlayer] method.
   */
  interface URLPlayerOptions {
    /**
     * Whether to loop playback.
     */
    loop?: boolean;
    /**
     * Whether the player is on pause after creation. To continue the playback, use the [Player.resume] method. The default value is false.
     */
    onPause?: boolean;
    /**
     * Whether to use progressive playback or not. If true, the file is delivered in chunks which reduces delay before a method call and playback. The default value is false.
     */
    progressivePlayback?: boolean;
  }
}

declare namespace VoxEngine {
  /**
   * An object which contains options for video recorder.
   */
  interface VideoOpt {
    /**
     * Whether to create single video file of multiple participants.
     */
    mixing: boolean;
    /**
     * Video quality profile.
     */
    profile?: 'nHD' | 'VGA' | 'HD' | 'FHD' | 'QHD' | '4K';
    /**
     * Video width in pixels.
     */
    width?: number;
    /**
     * Video height in pixels.
     */
    height?: number;
    /**
     * Video bitrate in kbps.
     */
    bitrate?: number;
    /**
     * Video frames per second.
     */
    fps?: number;
    /**
     * Video layout settings. If set to 'grid', all the video frames are the same size. If set to 'tribune', one active video frame is bigger than the others. If set to 'custom', you need to provide a layoutSettings option with an object specifying custom layout settings.
     */
    layout?: 'grid' | 'tribune' | 'custom';
    /**
     * If layout is set to custom, specifies custom video layout settings.
     */
    layoutSettings?: VoxTilerDrawArea[];
    /**
     * If layout is set to tribune, specifies which frame is bigger than the others. Set to 'vad' if you want the bigger frame to change to the speaking participant, or specify the participant's ID to show one person constantly.
     */
    layoutPriority?: 'vad' | string[];
    /**
     * Whether to show the participants' names on their video frames.
     */
    labels?: boolean;
    /**
     * Whether to highlight video frame of the speaking participant.
     */
    vad?: boolean;
    /**
     * HTML color code for the video file background.
     */
    background?: string;
    /**
     * Video frames' direction, left to right or right to left.
     */
    direction?: 'ltr' | 'rtl';
    /**
     * How to fill a participant's video source to the conference frame.
     */
    objectFit?: 'fill' | 'contain' | 'cover' | 'none';
    /**
     * A container to store custom data for the current recorder.
     */
    customData?: Object;
  }
}

declare namespace VoxEngine {
  /**
   * An object specifying video frame options.
   */
  interface VoxTilerDrawArea {
    /**
     * Video frame's priority.
     */
    priority: number;
    /**
     * Video frame's width.
     */
    width: number;
    /**
     * Video frame's height.
     */
    height: number;
    /**
     * Video frame's top margin.
     */
    top: number;
    /**
     * Video frame's left margin.
     */
    left: number;
    /**
     * The corresponding grid options object.
     */
    grid: VoxTilerGridDefinition[];
  }
}

declare namespace VoxEngine {
  /**
   * An object specifying grid options.
   */
  interface VoxTilerGridDefinition {
    /**
     * Minimum video frames for the grid.
     */
    fromCount: number;
    /**
     * Maximum video frames for the grid.
     */
    toCount?: number;
    /**
     * Number of columns in the grid.
     */
    colCount: number;
    /**
     * Number of rows in the grid.
     */
    rowCount: number;
  }
}

declare namespace VoxEngine {}

declare namespace VoximplantAvatar {
  /**
   * Avatar configuration object.
   */
  interface AvatarConfig {
    /**
     * Unique avatar id
     */
    avatarId: string;
    /**
     * Set of key-value pairs to be passed to an avatar for personalization (e.g., a customer's name). Can be obtained in the avatar script via [getCustomData](/docs/references/avatarengine/getcustomdata#getcustomdata) function
     */
    customData?: Object;
    /**
     * Whether an avatar should return detailed information on recognizing the user input (i.e. whether the **intents** are passed to [VoximplantAvatar.Events.UtteranceParsed](/docs/references/voxengine/voximplantavatar/events#utteranceparsed) in the avatar script)
     */
    extended?: boolean;
  }
}

declare namespace VoximplantAvatar {
  /**
   * Voximplant Avatar class (machine learning powered bot engine which allows your system to handle natural conversations with customers).
   */
  class Avatar {
    constructor(config: VoximplantAvatar.AvatarConfig);

    /**
     * Adds a handler for the specified [VoximplantAvatar.Events] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
     * @param event Event class (i.e., [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded))
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    addEventListener<T extends keyof VoximplantAvatar._Events>(
      event: VoximplantAvatar.Events | T,
      callback: (ev: VoximplantAvatar._Events[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [VoximplantAvatar.Events] event.
     * @param event Event class (i.e., [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded))
     * @param callback Handler function
     */
    removeEventListener<T extends keyof VoximplantAvatar._Events>(
      event: VoximplantAvatar.Events | T,
      callback?: (ev: VoximplantAvatar._Events[T]) => any
    ): void;

    /**
     * Changes the avatar state to the specified one. This method is designed to react to the [VoximplantAvatar.Events.Reply](/docs/references/voxengine/voximplantavatar/events#reply) event: often, after the avatar replies to a user, the dialogue is moved to the next state.
     * @param stateName Name of the next state
     */
    goToState(stateName: string): Promise<void>;

    /**
     * Sends a user phase to the avatar. In response, the avatar triggers the [VoximplantAvatar.Events.Reply](/docs/references/voxengine/voximplantavatar/events#reply) event.
     * @param text Utterance text
     */
    handleUtterance(text: string): Promise<void>;

    /**
     * Signalizes avatar, that timeout occurred for waiting for the customer input.
     */
    handleTimeout(): Promise<void>;

    /**
     * Transfers control to the avatar so it starts a conversation. Should be called only after the [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded) event is triggered.
     */
    start(): void;
  }
}

declare namespace VoximplantAvatar {
  /**
   * Creates a new [Avatar] instance to implement a custom bundle with ASR and TTS.
   * @param config Avatar configuration
   */
  function createAvatar(config: VoximplantAvatar.AvatarConfig): VoximplantAvatar.Avatar;
}

declare namespace VoximplantAvatar {
  /**
   * Creates a new [VoiceAvatar] instance with a pre-added bundle of ASR and TTS to handle calls.
   * @param config VoiceAvatar configuration
   */
  function createVoiceAvatar(
    config: VoximplantAvatar.VoiceAvatarConfig
  ): VoximplantAvatar.VoiceAvatar;
}

declare namespace VoximplantAvatar {
  /**
   * Avatar events.
   *
   * Add the following line to your scenario code to use the events:
   * ```
   * require(Modules.Avatar);
   * ```
   * @event
   */
  enum Events {
    /**
     * Triggers when an avatar script is loaded and ready to use.
     * @typedef _AvatarLoadedEvent
     */
    Loaded = 'AvatarEvents.Loaded',
    /**
     * Triggers when an avatar ends a conversation with a customer.
     * @typedef _AvatarFinishEvent
     */
    Finish = 'AvatarEvents.Finish',
    /**
     * Triggers when an avatar parses a customer's phrase. The recognized phrase can be used for debugging and logging recognition results if needed.
     * @typedef _AvatarUtteranceParsedEvent
     */
    UtteranceParsed = 'AvatarEvents.UtteranceParsed',
    /**
     * Triggers when an avatar is ready to reply to a customer.
     * @typedef _AvatarReplyEvent
     */
    Reply = 'AvatarEvents.Reply',
    /**
     * Triggers when an error occurs.
     * @typedef _AvatarErrorEvent
     */
    Error = 'AvatarEvents.Error',
  }

  /**
   * @private
   */
  interface _Events {
    [Events.Loaded]: _AvatarLoadedEvent;
    [Events.Finish]: _AvatarFinishEvent;
    [Events.UtteranceParsed]: _AvatarUtteranceParsedEvent;
    [Events.Reply]: _AvatarReplyEvent;
    [Events.Error]: _AvatarErrorEvent;
  }

  /**
   * @private
   */
  interface _AvatarLoadedEvent {}

  /**
   * @private
   */
  interface _AvatarFinishEvent {
    /**
     * Utterance to reply to the customer with
     */
    utterance?: string;
    /**
     * Additional data returned from the avatar. Can be passed through the [AvatarResponseParameters.customData](/docs/references/avatarengine/avatarresponseparameters#customdata) parameter
     */
    customData?: Object;
    /**
     * Current avatar state
     */
    currentState: string;
  }

  /**
   * @private
   */
  interface _AvatarUtteranceParsedEvent {
    /**
     * Recognized phrase text
     */
    text: string;
    /**
     * Most suitable intent recognized for the phrase (or 'unknown' if unclear)
     */
    intent: string;
    /**
     * Recognized phrase confidence
     */
    confidence?: number;
    /**
     * Current avatar state
     */
    currentState: string;
    /**
     * Number of the state visits
     */
    readonly visitsCounter: number;
    /**
     * Number of user phrases processed in this state
     */
    readonly utteranceCounter: number;
    /**
     * Default response to the intent from the UI
     */
    response: string;
    /**
     * Extended information of the intent recognition results [AvatarUtteranceIntent](/docs/references/avatarengine/avatarutteranceintent)
     */
    intents?: Object[];
    /**
     * Extracted entities (both system and custom) [AvatarEntities](/docs/references/avatarengine/avatarentities)
     */
    entities: Object;
  }

  /**
   * @private
   */
  interface _AvatarReplyEvent {
    /**
     * Utterance to reply to the customer with
     */
    utterance?: string;
    /**
     * Next avatar state. Optional
     */
    nextState?: string;
    /**
     * Current avatar state
     */
    currentState: string;
    /**
     * Optional. Whether an avatar listens to the user after saying its utterance (or during it, if interruptions are enabled)
     */
    listen?: true;
    /**
     * Additional data returned from an avatar. Can be passed through the [AvatarResponseParameters.customData](/docs/references/avatarengine/avatarresponseparameters#customdata) parameter
     */
    customData?: Object;
    /**
     * Time after which an avatar is ready to handle customer's interruptions (in case the avatar voices its response)
     */
    interruptableAfter?: number;
    /**
     * Whether an avatar's reply is final. If true, all other parameters except **customData** are ignored and the avatar does not process any more inputs in the current conversation
     */
    isFinal?: boolean;
    /**
     * Optional number value that specifies how long an avatar listens to the user after saying its utterance (or during it, if interruptions are enabled)
     */
    listenTimeout?: number;
  }

  /**
   * @private
   */
  interface _AvatarErrorEvent {
    /**
     * Error description
     */
    reason: string;
  }
}

declare namespace VoximplantAvatar {
  /**
   * VoiceAvatar configuration.
   */
  interface VoiceAvatarConfig {
    /**
     * Current call object
     */
    call: Call;
    /**
     * Avatar configuration
     */
    avatarConfig: VoximplantAvatar.AvatarConfig;
    /**
     * ASR parameters
     */
    asrParameters: ASRParameters;
    /**
     * TTS options
     */
    ttsPlayerOptions: VoxEngine.TTSPlayerOptions;
    /**
     * End of phrase timeout in milliseconds. If the ASR is running in the interim mode, we may not wait for the final response from the ASR, but instead, take the last interim, after which there are no new ones during this timeout. It allows us to reduce the time of voice recognition. This parameter should be set individually for each ASR vendor. **1000ms** is a good default value not to interrupt the user aggressively
     */
    asrEndOfPhraseDetectorTimeout?: number;
    /**
     * No input timeout in milliseconds. If no user input came from ASR during this period of time - then avatar is notified, that timeout occurred. Default value is 10 seconds
     */
    asrNoInputTimeout?: number;
    /**
     * Triggers when the avatar finishes talking. Returns a dictionary with the data collected during the avatar working process
     */
    onFinishCallback?: (avatarFinishEvent: VoximplantAvatar._AvatarFinishEvent) => void | Promise<void>;
    /**
     * Event handler that defines what happens to the call in case of internal errors of the avatar (for example, playing an error phrase or transferring the call to an agent)
     */
    onErrorCallback?: (avatarErrorEvent: VoximplantAvatar._AvatarErrorEvent) => void | Promise<void>;
  }
}

declare namespace VoximplantAvatar {
  /**
   * @private
   */
  interface _VoiceAvatarEvents extends VoximplantAvatar._Events, _ASREvents, _PlayerEvents {}
}

declare namespace VoximplantAvatar {
  /**
   * Voximplant voice avatar class is a superstructure over avatar with a pre-added bundle of ASR and TTS to handle calls.
   * As arguments, it accepts: a set of configuration parameters, callback functions and the [Call] instance. It independently implements automation for the interaction of [Avatar] and [Call] via the [TTS] and [ASR] modules (handles the events, causes business logic and execute the callback functions).
   * For more details see the [VoximplantAvatar.VoiceAvatarConfig].
   */
  class VoiceAvatar {
    constructor(config: VoximplantAvatar.VoiceAvatarConfig);

    /**
     * Adds a handler for the specified [VoximplantAvatar.Events], [ASREvents] or [PlayerEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
     * @param event Event class (i.e., [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded), [ASREvents.Stopped], [PlayerEvents.PlaybackFinished])
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    addEventListener<T extends keyof VoximplantAvatar._VoiceAvatarEvents>(
      event: VoximplantAvatar.Events | ASREvents | PlayerEvents | T,
      callback: (ev: VoximplantAvatar._VoiceAvatarEvents[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [VoximplantAvatar.Events], [ASREvents] or [PlayerEvents] event.
     * @param event Event class (i.e., [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded), [ASREvents.Stopped], [PlayerEvents.PlaybackFinished])
     * @param callback Handler function
     */
    removeEventListener<T extends keyof VoximplantAvatar._VoiceAvatarEvents>(
      event: VoximplantAvatar.Events | ASREvents | PlayerEvents | T,
      callback: (ev: VoximplantAvatar._VoiceAvatarEvents[T]) => any
    ): void;
  }
}

/**
 * Represents an ML-powered bot engine that allows your system to handle natural conversations with users.
 *
 * Add the following line to your scenario code to use the ref folder:
 * ```
 * require(Modules.Avatar);
 * ```
 */
declare namespace VoximplantAvatar {}

declare type VoxMediaUnit = Call | Player | Conference | Recorder | WebSocket | StreamingAgent;

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.WebSocket);
 * ```
 * Available audio encoding formats to pass to 'encoding'. The default value is 'PCM8'.
 */
declare enum WebSocketAudioEncoding {
  /**
   * Pulse-code modulation, 8kHz.
   */
  PCM8,
  /**
   * Pulse-code modulation, 16kHz.
   */
  PCM16,
  /**
   * A-law algorithm, 8kHz.
   */
  ALAW,
  /**
   * μ-law algorithm, 8kHz.
   */
  ULAW,
  /**
   * Codec for **audio/ogg** and **audio/opus** MIME types, 48kHz.
   */
  OPUS,
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.WebSocket);
 * ```
 */
declare enum WebsocketCloseCode {
  /**
   * Normal connection closure.
   */
  CLOSE_NORMAL = 1000,
  /**
   * Endpoint left (browser tab closing).
   */
  CLOSE_GOING_AWAY = 1001,
  /**
   * Endpoint received a malformed frame.
   */
  CLOSE_PROTOCOL_ERROR = 1002,
  /**
   * Endpoint received an unsupported frame.
   */
  CLOSE_UNSUPPORTED = 1003,
  /**
   * Expected close status, received none.
   */
  CLOSED_NO_STATUS = 1005,
  /**
   * No close code frame has been received.
   */
  CLOSE_ABNORMAL = 1006,
  /**
   * Endpoint received inconsistent message.
   */
  CLOSE_UNSUPPORTED_PAYLOAD = 1007,
  /**
   * Received message violates endpoint policy.
   */
  CLOSE_POLICY_VIOLATION = 1008,
  /**
   * Too big frame.
   */
  CLOSE_TOO_LARGE = 1009,
  /**
   * Client wanted an extension which server does not negotiate.
   */
  CLOSE_MANDATORY_EXTENSION = 1010,
  /**
   * Internal server error while operating.
   */
  CLOSE_SERVER_ERROR = 1011,
  /**
   * Server/service is restarting.
   */
  CLOSE_SERVICE_RESTART = 1012,
  /**
   * Temporary server condition forced blocking the client's request.
   */
  CLOSE_TRY_AGAIN_LATER = 1013,
  /**
   * Server acting as gateway received an invalid response.
   */
  CLOSE_BAD_GATEWAY = 1014,
  /**
   * Failed to perform a TLS handshake.
   */
  CLOSE_TLS_FAIL = 1015,
}

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.WebSocket);
 * ```
 * @event
 */
declare enum WebSocketEvents {
  /**
   * Triggers when the WebSocket connection is closed. [WebSocket.onclose] is called right before any other handlers.
   * @typedef _WebSocketCloseEvent
   */
  CLOSE = 'WebSocket.Close',
  /**
   * Triggers when an error occurs during the WebSocket connection. [WebSocket.onerror] is called right before any other handlers.
   * @typedef _WebSocketErrorEvent
   */
  ERROR = 'WebSocket.Error',
  /**
   * Triggers when a message is received by a target object. [WebSocket.onmessage] is called right before any other handlers.
   * @typedef _WebSocketMessageEvent
   */
  MESSAGE = 'WebSocket.Message',
  /**
   * Triggers when the WebSocket connection is opened. [WebSocket.onopen] is called right before any other handlers.
   * @typedef _WebSocketOpenEvent
   */
  OPEN = 'WebSocket.Open',
  /**
   * Triggers when the audio stream sent by a third party through a WebSocket is started playing.
   * @typedef _WebSocketMediaStartedEvent
   */
  MEDIA_STARTED = 'WebSocket.MEDIA_STARTED',
  /**
   * Triggers after the end of the audio stream sent by a third party through a WebSocket (1 second of silence).
   * @typedef _WebSocketMediaEndedEvent
   */
  MEDIA_ENDED = 'WebSocket.MEDIA_ENDED',
}

/**
 * @private
 */
declare interface _WebSocketEvents {
  [WebSocketEvents.CLOSE]: _WebSocketCloseEvent;
  [WebSocketEvents.ERROR]: _WebSocketErrorEvent;
  [WebSocketEvents.MESSAGE]: _WebSocketMessageEvent;
  [WebSocketEvents.OPEN]: _WebSocketOpenEvent;
  [WebSocketEvents.MEDIA_STARTED]: _WebSocketMediaStartedEvent;
  [WebSocketEvents.MEDIA_ENDED]: _WebSocketMediaEndedEvent;
}

/**
 * @private
 */
declare interface _WebSocketEvent {
  /**
   * WebSocket object that triggered the event.
   */
  readonly websocket: WebSocket;
}

/**
 * @private
 */
declare interface _WebSocketCloseEvent extends _WebSocketEvent {
  /**
   * WebSocket close code.
   */
  readonly code: WebsocketCloseCode;
  /**
   * Reason why the connection is closed.
   */
  readonly reason: string;
  /**
   * Whether the connection is cleanly closed.
   */
  readonly wasClean: boolean;
}

/**
 * @private
 */
declare interface _WebSocketErrorEvent extends _WebSocketEvent {}

/**
 * @private
 */
declare interface _WebSocketMessageEvent extends _WebSocketEvent {
  /**
   * The data sent by the message emitter.
   */
  readonly data: string;
}

/**
 * @private
 */
declare interface _WebSocketOpenEvent extends _WebSocketEvent {}

/**
 * @private
 */
declare interface _WebSocketMediaStartedEvent extends _WebSocketEvent {
  /**
   * Special tag to name audio streams sent over one WebSocket connection. With it, one can send 2 audios to 2 different calls at the same time.
   */
  tag: string;
  /**
   * Custom data.
   */
  customParameters: { [key: string]: string };
}

/**
 * @private
 */
declare interface _WebSocketMediaEndedEvent extends _WebSocketEvent {
  /**
   * Special tag to name audio streams sent over one WebSocket connection. With it, one can send 2 audios to 2 different calls at the same time.
   */
  tag: string;
  /**
   * Information about the audio stream that can be obtained after the stream stops or pauses (1-sec silence).
   */
  mediaInfo: WebSocketMediaInfo;
}

declare interface WebSocketMediaInfo {
  /**
   * Audio stream duration.
   */
  duration: number;
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.WebSocket);
 * ```
 */
declare enum WebSocketReadyState {
  /**
   * Connection is closed or cannot be opened.
   */
  CLOSED,
  /**
   * Connection is closing.
   */
  CLOSING,
  /**
   * Connection is in the process.
   */
  CONNECTING,
  /**
   * Connection is open and ready to communicate.
   */
  OPEN,
}

/**
 * Represents a WebSocket object that provides the API for creating and managing an outbound or inbound WebSocket connection, as well as for sending and receiving data to/from it.
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.WebSocket);
 * ```
 * @param url URL to connect (wss:// + domain + path).
 * @param protocols Either a single protocol string or an array of protocol strings. The default value is 'chat'.
 */
declare class WebSocket {
  constructor(url: string, protocols?: string | string[]);

  /**
   * Event handler to call when the connection is closed.
   */
  onclose: ((ev: _WebSocketCloseEvent) => any) | null;

  /**
   * Event handler to call when an error occurs.
   */
  onerror: ((ev: _WebSocketErrorEvent) => any) | null;

  /**
   * Event handler to call when a message is received.
   */
  onmessage: ((ev: _WebSocketMessageEvent) => any) | null;

  /**
   * Event handler to call when the connection is open (ready to send and receive data).
   */
  onopen: ((ev: _WebSocketOpenEvent) => any) | null;

  /**
   * Event handler to call when the audio stream is started playing.
   */
  onmediastarted: (ev: _WebSocketMediaStartedEvent) => any | null;

  /**
   * Event handler to call after the end of the audio stream.
   */
  onmediaended: (ev: _WebSocketMediaEndedEvent) => any | null;

  /**
   * Returns the current state of the WebSocket connection.
   */
  readonly readyState: WebSocketReadyState;

  /**
   * Returns the absolute URL of the WebSocket. For outbound connection, it is the URL to which to connect; for inbound, it is the WebSocket session URL.
   */
  readonly url: string;

  /**
   * Closes the WebSocket connection or connection attempt.
   * @param code WebSocket close code.
   * @param reason Reason why the connection is closed.
   */
  close(code?: WebsocketCloseCode, reason?: string): void;

  /**
   * Enqueues the specified data to be transmitted over the WebSocket connection.
   * @param data Data to send through a WebSocket.
   */
  send(data: string): void;

  /**
   * Adds a handler for the specified [WebSocketEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called
   * @param event Event class (i.e., [WebSocketEvents.OPEN])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _WebSocketEvents>(
    event: WebSocketEvents | T,
    callback: (ev: _WebSocketEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [WebSocketEvents] event
   * @param event Event class (i.e., [WebSocketEvents.OPEN])
   * @param callback Handler function. If not specified, all event listeners are removed
   */
  removeEventListener<T extends keyof _WebSocketEvents>(
    event: WebSocketEvents | T,
    callback?: (ev: _WebSocketEvents[T]) => any
  ): void;

  /**
   * Starts sending media with the specified parameters to the target unit. WebSocket works in real time and the recommended duration of one audio chunk is 20ms.
   * @param targetMediaUnit Media unit that receives media.
   * @param optional Custom parameters for WebSocket interaction only.
   */
  sendMediaTo(targetMediaUnit: VoxMediaUnit, optional: SendMediaOptions): void;

  /**
   * Stops sending media with the specified parameters to the target unit.
   * @param targetMediaUnit Media unit that stops receiving media.
   * @param optional Custom parameters for WebSocket interaction only.
   */
  stopMediaTo(targetMediaUnit: VoxMediaUnit, optional: SendMediaOptions): void;
}
