
/**
 * [ACDRequest] parameters. Can be passed as arguments to the [VoxEngine.enqueueACDRequest] method.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.ACD);
 * ```
 */
declare interface ACDEnqueueParameters {
  /**
   * Priority (1-100, 1 is the highest priority).
   * If two or more objects have the same priorities, they are handled according to the order of HTTP requests from JS scenario to the ACD queue.
   */
  priority: number;
  /**
   * Optional. Extra headers to be passed with the call to the agent.
   * Custom header names have to begin with the 'X-' prefix except the 'VI-CallTimeout': '60' which switches to another agent if current one does not answer after the timeout (in seconds, the default value is **60**, must not be less than **10** or greater than **400**).
   * The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  headers?: { [header: string]: string };
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
   * Triggered when an agent is reached.
   * @typedef _ACDReachedEvent
   */
  OperatorReached = 'ACD.OperatorReached',
  /**
   * Triggered when an ACD makes a call to a user via the [callUser] method.
   * @typedef _ACDCallAttempt
   */
  OperatorCallAttempt = 'ACD.OperatorCallAttempt',
  /**
   * Triggered when an ACD request tries to reach an agent, but the agent declines the call. IMPORTANT NOTE: This is just a notification, the request processing does not stop. The ACD request automatically redirects to the next free agent.
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
   * Triggered when an [ACDRequest] is put to the queue.
   * @typedef _ACDQueuedEvent
   */
  Queued = 'ACD.Queued',
  /**
   * Triggers if all agents that can handle a request in the specified queue are offline. In this case, the request is not queued.
   * @typedef _ACDOfflineEvent
   */
  Offline = 'ACD.Offline',
  /**
   * Triggered when we have one more request to put in the queue but the maximum number of requests (max_queue_size) is already reached. In this case, the new request is not queued. The max_queue_size and max_waiting_time default values are “unlimited”, you can change these values for every new or existing queue in the [control panel](https://manage.voximplant.com/applications).
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
 * Represents a request that is put to the ACD queue.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.ACD);
 * ```
 */
declare class ACDRequest {
  /**
   * Returns the request's id. It can be used as the <b>acd\_request\_id</b> parameter in the [GetACDHistory](/docs/references/httpapi/managing_history#getacdhistory) method to search in ACD history.
   */
  id(): string;

  /**
   * Gets status of the current request. Not to be called before the request is successfully queued (the [ACDEvents.Queued] event). This method's call triggers the [ACDEvents.Waiting] event; it is possible to retrieve an estimated waiting time in minutes via the <b>ewt</b> property of the event.
   */
  getStatus(): void;

  /**
   * Adds a handler for the specified [ACDEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [ACDEvents.Offline])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _ACDEvents>(
    event: ACDEvents | T,
    callback: (event: _ACDEvents[T]) => any,
  ): void;

  /**
   * Removes a handler for the specified [ACDEvents] event.
   * @param event Event class (i.e., [ACDEvents.Offline])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _ACDEvents>(
    event: ACDEvents | T,
    callback?: (event: _ACDEvents[T]) => any,
  ): void;

  /**
   * Cancel pending request and remove it from the queue
   */
  cancel(): void;
}

/**
 * The AI module provides additional methods that use Artificial Intelligence. These methods allow solving business tasks in a more productive way.
 * <br>
 * Add the following line to your scenario code to use the namespace:
 * ```
 * require(Modules.AI);
 * ```
 */
declare namespace AI {}

declare namespace AI {
  /**
   * Creates a new [AI.Dialogflow] instance which provides resources for exchanging data with the Dialogflow API, handling events, etc. You can attach media streams later via the [AI.DialogflowInstance.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.AI);
   * ```
   * @param parameters Dialogflow parameters
   */
  function createDialogflow(parameters: DialogflowSettings): DialogflowInstance;
}

declare namespace AI {
  /**
   * Represents a parameters of the voicemail recognition session.
   * <br>
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   * @deprecated Use [AMD] instead
   **/
  interface DetectVoicemailParameters {
    /**
     * Optional. Recognition model. The possible values are **ru**, **colombia**. The default value is **ru**.
     */
    model?: string;
    /**
     * Optional. Detection threshold in the **0.0 - 1.0 milliseconds** range. Durations shorter than this value are considered human speech, and durations longer than this value are considered voicemail. The default value is **0.8**. Available only with the **latam** model.
     */
    threshold?: number;
  }
}

declare namespace AI {
  /**
   * Start a voicemail recognition session. You can check how many times voicemail was detected in the call history.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.AI);
   * ```
   * @param call
   * @param parameters
   * @deprecated Use [AMD] instead
   */
  function detectVoicemail(
      call: Call,
      parameters: DetectVoicemailParameters
  ): Promise<AI.Events>;
}

declare namespace AI {
  /**
   * Dialogflow events allow matching intents by event name instead of the natural language input.
   * <br>
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
   * Represents a Dialogflow instance.
   * <br>
   * Add the following line to your scenario code to use the class:
   * ```
   * require(Modules.AI);
   * ```
   */
  class DialogflowInstance {
    /**
     * @param id
     * @param parameters Dialogflow parameters
     */
    constructor(id: string, parameters: Object);

    /**
     * Returns the dialogflow instance's id.
     */
    id(): string;

    /**
     * Set parameters for the intents.
     * @param queryParameters Query parameters
     */
    setQueryParameters(queryParameters: DialogflowQueryParameters): void;

    /**
     * Set a collection of phrase hints for the intents.
     * @param phraseHints The collection of phrase hints to boost the speech recognition accuracy
     */
    setPhraseHints(phraseHints: { [id: string]: string }): void;

    /**
     * Update the audio output configuration.
     * @param outputAudioConfig Config of the audio output
     */
    setOutputAudioConfig(outputAudioConfig: DialogflowOutputAudioConfig): void;

    /**
     * Stop and destroy the current Dialogflow instance.
     */
    stop(): void;

    /**
     * Send a query to the DialogFlow instance. You can send either a text string up to **256 characters** or an event object with the event name and additional data.
     * @param dialogflowQuery Text string (up to **256 characters**) or an event object
     */
    sendQuery(dialogflowQuery: DialogflowQueryInput): void;

    /**
     * Add a Dialogflow speech synthesis playback marker. The [AI.Events.DialogflowPlaybackMarkerReached](/docs/references/voxengine/ai/events#dialogflowplaybackmarkerreached) event is triggered when the marker is reached.
     * @param offset Positive/negative offset in milliseconds from the start/end of media
     */
    addMarker(offset: number): void;

    /**
     * Starts sending media (voice) from a Dialogflow participant to the media unit.
     * @param mediaUnit Media unit that receives media
     * @param parameters Optional. WebSocket interaction only parameters
     */
    sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

    /**
     * Stops sending media (voice) from a Dialogflow participant to the media unit.
     */
    stopMediaTo(mediaUnit: VoxMediaUnit): void;

    /**
     * Adds a handler for the specified [AI.Events]. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
     * @param event Event class (i.e., [AI.Events.DialogflowResponse])
     * @param callback Handler function. A single parameter is passed: object with event information
     */
    addEventListener<T extends keyof AI._Events>(
      event: AI.Events | T,
      callback: (event: AI._Events[T]) => any,
    ): void;

    /**
     * Removes a handler for the specified [AI.Events] event.
     * @param event Event class (i.e., [AI.Events.DialogflowResponse])
     * @param callback Optional. Handler function. If not specified, all handler functions are removed
     */
    removeEventListener<T extends keyof AI._Events>(
      event: AI.Events | T,
      callback?: (event: AI._Events[T]) => any,
    ): void;
  }
}

declare namespace AI {
  /**
   * Instructs the speech synthesizer on how to generate the output audio content.
   * <br>
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
   * Represents a Dialogflow query input. It can contain either:
   * 1. A conversational query in the form of text
   * 2. An event that specifies which intent to trigger
   * <br>
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
   * Represents a parameters of the conversational query.
   * <br>
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   **/
  interface DialogflowQueryParameters {
    /**
     * Optional. The time zone of the conversational query from the time zone database, e.g., America/New_York, Europe/Paris. If not provided, the system uses the time zone specified in agent settings.
     */
    timeZone?: string;
    /**
     * Optional. The geolocation of the conversational query.
     */
    geoLocation?: { [key: string]: any };
    /**
     * Optional. The collection of contexts to be activated before the query execution.
     */
    contexts?: any[];
    /**
     * Optional. Whether to delete all contexts in the current session before activation of a new one.
     */
    resetContexts?: boolean;
    /**
     * Optional. The collection of session entity types to replace or extend developer entities with for this query only. The entity synonyms apply to all languages.
     */
    sessionEntityTypes?: any[];
    /**
     * Optional. Use this field to pass custom data into the webhook associated with the agent. Arbitrary JSON objects are supported.
     */
    payload?: { [key: string]: any };
  }
}

declare namespace AI {
  /**
   * Represents a Dialogflow intent response.
   * <br>
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
   * Represents a result of an intent response.
   * <br>
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
   * <br>
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
     * Optional. Whether to use beta. The Voximplant Dialogflow Connector uses Dialogflow v2 Beta by default. Set false to use the non-Beta version of Dialogflow v2.
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

declare namespace AI {
  /**
   * Contains a speech recognition result, corresponding to a portion of the audio that is currently being processed; or an indication that this is the end of the single requested utterance.
   * <br>
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
     * The default of **0.0** is a sentinel value indicating confidence was not set. If **false**, the *StreamingRecognitionResult* represents an interim result that may change. If **true**, the recognizer does not return any further hypotheses about this piece of the audio.
     */
    isFinal: boolean;
    /**
     * The Speech confidence between **0.0** and **1.0** for the current portion of audio. The default of **0.0** is a sentinel value indicating that confidence was not set. Note that the field is typically only provided if **is_final: true**, and you should not rely on it being accurate or even set.
     */
    confidence: number;
  }
}

declare namespace AI {
  /**
   * Configuration of how speech should be synthesized.
   * <br>
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
    voice?: DialogflowVoiceSelectionParameters;
  }
}

declare namespace AI {
  /**
   * Represents a natural language text to be processed.
   * <br>
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
   * <br>
   * Add the following line to your scenario code to use the interface:
   * ```
   * require(Modules.AI);
   * ```
   */
  interface DialogflowVoiceSelectionParameters {
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
     * Triggered when a Dialogflow instance returns a query result.
     * @typedef _DialogflowQueryResultEvent
     */
    DialogflowQueryResult = 'AI.Events.DialogflowQueryResult',
    /**
     * Triggered when a Dialogflow instance returns a recognition result.
     * @typedef _DialogflowRecognitionResultEvent
     */
    DialogflowRecognitionResult = 'AI.Events.DialogflowRecognitionResult',
    /**
     * Triggered when a Dialogflow instance returns an intent response.
     * @typedef _DialogflowResponseEvent
     */
    DialogflowResponse = 'AI.Events.DialogflowResponse',
    /**
     * Triggered when a Dialogflow instance causes error.
     * @typedef _DialogflowErrorEvent
     */
    DialogflowError = 'AI.Events.DialogflowError',
    /**
     * Triggered when a Dialogflow instance is stopped.
     * @typedef _DialogflowStoppedEvent
     */
    DialogflowStopped = 'AI.Events.DialogflowStopped',
    /**
     * Triggered when a playback of a single phrase is finished successfully or in case of playback error.
     * @typedef _DialogflowPlaybackFinishedEvent
     */
    DialogflowPlaybackFinished = 'AI.Events.DialogflowPlaybackFinished',
    /**
     * Triggered when a playback of a single phrase is started.
     * @typedef _DialogflowPlaybackStartedEvent
     */
    DialogflowPlaybackStarted = 'AI.Events.DialogflowPlaybackStarted',
    /**
     * Triggered when 'DialogflowInstance.addMarker' is reached.
     * @typedef _DialogflowPlaybackMarkerReachedEvent
     */
    DialogflowPlaybackMarkerReached = 'AI.Events.DialogflowPlaybackMarkerReached',
    /**
     * Triggered when an answering machine or voicemail is detected.
     * @typedef _VoicemailDetectedEvent
     * @deprecated Use [AMD] instead
     */
    VoicemailDetected = 'AI.Events.VoicemailDetected',
    /**
     * Triggered when an answering machine or voicemail is not detected.
     * @typedef _VoicemailNotDetectedEvent
     * @deprecated Use [AMD] instead
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
     * Link to the Dialogflow instance.
     */
    dialogflow: DialogflowInstance;
  }

  /**
   * @private
   */
  interface _DialogflowQueryResultEvent extends _DialogflowEvent {
    /**
     * The results of the conversational query or event processing.
     */
    result: DialogflowResult;
  }

  /**
   * @private
   */
  interface _DialogflowRecognitionResultEvent extends _DialogflowEvent {
    /**
     * The default of **0.0** is a sentinel value indicating confidence was not set. If **false**, the *StreamingRecognitionResult* represents an interim result that may change. If **true**, the recognizer does not return any further hypotheses about this piece of the audio.
     */
    isFinal: boolean;
  }

  /**
   * @private
   */
  interface _DialogflowResponseEvent extends _DialogflowEvent {
    /**
     * The intent response.
     */
    response: DialogflowResponse;
  }

  /**
   * @private
   */
  interface _DialogflowErrorEvent extends _DialogflowEvent {
    /**
     * The cause of the event.
     */
    cause: string;
  }

  /**
   * @private
   */
  interface _DialogflowStoppedEvent extends _DialogflowEvent {
    /**
     * The cause of the event.
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
     * Playback duration.
     */
    duration: number;
  }

  /**
   * @private
   */
  interface _DialogflowPlaybackMarkerReachedEvent extends _DialogflowEvent {
    /**
     * Marker offset.
     */
    offset: number;
  }

  /**
   * @private
   */
  interface _VoicemailBaseEvent {
    /**
     * Call that triggers the event.
     */
    call: Call;
  }

  /**
   * @private
   */
  interface _VoicemailDetectedEvent extends _VoicemailBaseEvent {
    /**
     * Recognition confidence. Values range from **0** (completely uncertain) to **100** (completely certain). The value is not guaranteed to be accurate, consider it while handling the event.
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
     * Recognition model - [AMD.Model].
     */
    model: AMD.Model;
    /**
     * Optional. Detection timeout in milliseconds. Note that the timeout is only triggered after the [CallEvents.Connected] event. The default value is **6500**. Must not be less than **0** or greater than **20000**.
     */
    timeout?: number;
    /**
     * Optional. Detection threshold in the range **0.0** - **1.0**.
     */
    thresholds?: AMD.Thresholds;
  }
}

/**
 * Answering Machine Detection provides methods that allow developers to recognize voicemail prompts with the help of artificial intelligence.
 * Read more about the topic in the [Voicemail detection](/docs/guides/calls/voicemail-detection) article.
 */
declare namespace AMD {}

declare namespace AMD {
  /**
   * Answering machine or voicemail detector class.
   */
  class AnsweringMachineDetector {
    readonly call?: Call;

    readonly model: AMD.Model;
    readonly timeout?: number;

    /**
     * Returns the Answering machine detector's id.
     */
    id(): string;

    /**
     * Starts answering machine or voicemail recognition session.
     */
    detect(): Promise<AMD.Events>;

    /**
     * Adds a handler for the specified [AMD.Events]. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called.
     * @param event Event class (e.g., [AMD.Events.DetectionComplete])
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    addEventListener<T extends keyof AMD._Events>(
      event: AMD.Events | T,
      callback: (event: AMD._Events[T]) => any,
    ): void;

    /**
     * Removes a handler for the specified [AMD.Events] event.
     * @param event Event class (i.e., [AMD.Events.DetectionComplete])
     * @param callback Optional. Handler function. If not specified, all handler functions are removed
     */
    removeEventListener<T extends keyof AMD._Events>(
      event: AMD.Events | T,
      callback?: (event: AMD._Events[T]) => any,
    ): void;
  }
}

declare namespace AMD {
  /**
   * Creates a new [AMD.AnsweringMachineDetector](answering machine or voicemail detector) instance. You can attach sources later via the [VoxMediaUnit] **sendMediaTo** method.
   */
  function create(parameters: AMD.AMDParameters): AMD.AnsweringMachineDetector;
}

declare namespace AMD {
  /**
   * @event
   */
  enum Events {
    /**
     * Triggered when answering machine or voicemail detection is complete.
     * @typedef AMD._DetectionCompleteEvent
     */
    DetectionComplete = 'AMD.Events.DetectionComplete',
    /**
     * Triggered when answering machine detector throw an error.
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
  interface _AMDEvent {
    /**
     * AMD istance that generated the event
     */
    amd: AMD.AnsweringMachineDetector;
  }

  /**
   * @private
   */
  interface _DetectionCompleteEvent extends _AMDEvent{
    /**
     * Call that triggers the event.
     */
    call: Call;
    /**
     * The id of the Call.
     */
    callId: string;
    /**
     * Answering machine result class, such as human, voicemail, timeout or call termination.
     */
    resultClass: AMD.ResultClass;
    /**
     * Answering machine result subtype, such as MIMIC or NONE.
     */
    resultSubtype?: AMD.ResultSubtype;
    /**
     * Recognition confidence. Values range from 0 (completely uncertain) to 100 (completely certain). The value is not guaranteed to be accurate, consider it while handling the event.
     */
    confidence?: number;
  }

  /**
   * @private
   */
  interface _DetectionErrorEvent extends _AMDEvent{
    /**
     * The id of the Call.
     */
    callId?: string;
    /**
     * Error message.
     */
    message: string;
  }
}

declare namespace AMD {
  /**
   * Answering machine or voicemail detector model.
   */
  enum Model {
    /**
     * Brazil
     */
    BR = 'br',
    /**
     * Chile
     */
    CL = 'cl',
    /**
     * Colombia
     */
    CO = 'colombia',
    /**
     * Kazakhstan
     */
    KZ = 'kz',
    /**
     * Mexico
     */
    MX = 'mx',
    /**
     * Russia
     */
    RU = 'ru',
    /**
     * Philippines
     */
    PH = 'ph',
    /**
     * Peru
     */
    PE = 'pe',
    /**
     * United States
     */
    US = 'us',
    /**
     * General European multilingual model
     */
    EU_GENERAL = 'eu_general',
  }
}

declare namespace AMD {
  /**
   * Answering machine result class, such as human, voicemail, timeout or call termination.
   */
  enum ResultClass {
    /**
     * AMD detected a voicemail prompt.
     */
    VOICEMAIL = 'VOICEMAIL',
    /**
     * AMD detected a human answering.
     */
    HUMAN = 'HUMAN',
    /**
     * AMD reached the recognition timeout.
     */
    TIMEOUT = 'TIMEOUT',
    /**
     * AMD detected a call hangup.
     */
    CALL_ENDED = 'CALL_ENDED',
  }
}

declare namespace AMD {
  /**
   * Answering machine result subtype, such as mimic or none.
   */
  enum ResultSubtype {
    MIMIC = 'MIMIC',
    NONE = 'NONE',
  }
}

declare namespace AMD {
  /**
   * Detection threshold in the range **0.0** - **1.0**
   */
  interface Thresholds {
    human?: number;
    voicemail?: number;
    mimic?: number;
  }
}

/**
 * @event
 */
declare enum AppEvents {
  /**
   * Triggered when an incoming call arrives.
   * @typedef _CallAlertingEvent
   */
  CallAlerting = 'Application.CallAlerting',
  /**
   * Triggered when a session is about to terminate. Triggers in two cases:<br>
   * 1) when there are no calls and/or ACD requests in a call session. See the [session limits](/docs/guides/voxengine/limits) for details;<br>
   * 2) when the [VoxEngine.terminate](/docs/references/voxengine/voxengine/terminate) method is called. Timers and any other external resources are not available after this event is triggered,
   * but you can perform one HTTP request inside the event handler (e.g. to notify an external system about the fact that the session is finished).
   * When that request is finished (or no such request is made), the [AppEvents.Terminated] event is triggered.
   * @typedef _TerminatingEvent
   */
  Terminating = 'Application.Terminating',
  /**
   * Triggered when a session is terminated and after the [AppEvents.Terminating] event is triggered.
   * The time between these events depends on handler for [AppEvents.Terminating] event.
   * Use the event just for debugging, only the [Logger.write] method could be used in a handler.
   * @typedef _TerminatedEvent
   */
  Terminated = 'Application.Terminated',
  /**
   * The very first event is triggered due to incoming call or HTTP request to Voximplant cloud over the internet.
   * Triggers only once in a session, so if you execute the same HTTP request again it creates the new, separate session.
   * Note that usage of the event in your JS scenario is optional.
   * @typedef _StartedEvent
   */
  Started = 'Application.Started',
  /**
   * Triggered when the managing HTTP request is received by the session.
   * If you [start a call session with HTTP request](/docs/references/httpapi/managing_scenarios#startscenarios), you get an answer: an object with media\_session\_access\_url property.
   * The property's value is the managing URL for the specified session, so it can be used in managing HTTP request that triggers [AppEvents.HttpRequest] event.
   * @typedef _HttpRequestEvent
   */
  HttpRequest = 'Application.HttpRequest',

  /**
   * Triggered when there is a new connection to a WebSocket.
   * @typedef _NewWebSocketEvent
   */
  WebSocket = 'AppEvents.NewWebSocketConnection',

  /**
   * Triggered when a WebSocket fails. It can happen when the number of incoming WebSocket connections exceeds the number of calls in one session + 3.
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
   *  HTTP request method. E.g. 'POST'.
   */
  method: string;
  /**
   *  HTTP path requested (without the domain name). E.g. '/request/1d61f27ba2faad53.1500645140.80028_185.164.148.244/eb4b0539b13e2401'.
   */
  path: string;
  /**
   *  HTTP request content. E.g. '{"param1": "value1", "param2": "value2"}'.
   */
  content: string;
  /**
   * List of dictionaries with key and value fields representing HTTP headers (the ones starting with "X-").
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
   * Unique identification number of the Voximplant account. Can be used as one of the [authentication parameters](/docs/references/httpapi/auth_parameters) in management API methods.
   */
  accountId: number;
  /**
   * Unique identification number of Voximplant application. Can be used in [Managing Applications](/docs/references/httpapi/managing_applications) in management API methods.
   */
  applicationId: number;
  /**
   * Direct link to the call's log.
   */
  logURL: string;
  /**
   * Identification number of JS session that is unique within an account and its child accounts. Can be used in [Managing History](/docs/references/httpapi/managing_history) in management API methods.
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
   * Incoming call that triggered the event.
   */
  call: Call;
  /**
   * Name of the event - "Application.CallAlerting".
   */
  name: string;
  /**
   * CallerID for current call.
   */
  callerid: string;
  /**
   * Dialed number.
   */
  destination: string;
  /**
   * Dialed SIP URI.
   */
  toURI: string;
  /**
   * Source CallerID with domain or SIP URI for incoming SIP call.
   */
  fromURI: string;
  /**
   * Displayable name of the caller.
   */
  displayName: string;
  /**
   * Custom SIP headers received with the call (the ones starting with "X-").
   */
  headers: { [header: string]: string };
  /**
   * Optional. Custom data for the current call object. It can be passed from Web SDK via the [Client.call](/docs/references/websdk/voximplant/client#call) method in the *customData* parameter.
   */
  customData?: string;
  /**
   * Internal information about codecs, should be passed to the [VoxEngine.callUser], [VoxEngine.callUserDirect], [VoxEngine.callSIP], [VoxEngine.callConference], [Call.answer], [Call.answerDirect], [Call.startEarlyMedia] methods call.
   */
  scheme: string;
}

/**
 * Represents an application storage object to manipulate key-value pairs.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.ApplicationStorage);
 * ```
 */
declare namespace ApplicationStorage {
}

declare namespace ApplicationStorage {
  /**
   * Retrieves a value of the specified key.
   * @param key Key to get
   */
  function get(key: string): Promise<StorageKey | null>;
}

declare namespace ApplicationStorage {
  /**
   * Retrieves all the keys assigned to a Voximplant application.
   * @param pattern Optional. Namespace that keys should contain
   */
  function keys(pattern?: string): Promise<StoragePage>;
}

declare namespace ApplicationStorage {
  /**
   * Creates a key-value pair. If an already existing **key** is passed, the method updates its **value**.
   * <br>
   * The keys should be unique within a Voximplant application.
   * @param key Key to create/update, up to 200 characters. A key can contain a namespace that is written before a colon, for example, test:1234. Thus, namespace "test" can be used as a **pattern** in the [keys](/docs/references/voxengine/applicationstorage#keys) method to find the keys with the same namespace. If no namespace is set, the key itself is considered as namespace
   * @param value Value for the specified key, up to 2000 characters
   * @param ttl Key expiry time in seconds. The value is in range of 0..7,776,000 (90 days). The TTL is converted to an `expireAt` Unix timestamp field as part of the storage object. Note that the pricing is tiered in three day-based pieces: 0-30, 31-60, 61-90. See the details [here](https://voximplant.com/pricing)
   */
  function put(key: string, value: string, ttl: number): Promise<StorageKey>;
}

declare namespace ApplicationStorage {
  /**
   * Removes the specified key. Note that the returned **StorageKey** always has zero **ttl**.
   * @param key Key to delete
   */
  function remove(key: string): Promise<StorageKey>;
}

/**
 * List of available dictionaries for ASR.
 * <br>
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
   * ASR Russian T-Bank dictionary
   * @deprecated Use [ASRModelList] instead
   */
  TBANK = 'asr-dict-tinkoff-',
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
   * Triggers in case of errors during the recognition process.
   * @typedef _ASRErrorEvent
   */
  ASRError = 'ASR.Error',
  /**
   * Triggers after ASR instance is created.
   * @typedef _ASRStartedEvent
   */
  Started = 'ASR.Started',
  /**
   * Triggers after ASR detected voice input and started collecting audio data for ASR.
   * @typedef _ASRCaptureStartedEvent
   */
  CaptureStarted = 'ASR.CaptureStarted',
  /**
   * Triggers after ASR captured audio data, before recognition process.
   * @typedef _ASRSpeechCapturedEvent
   */
  SpeechCaptured = 'ASR.SpeechCaptured',
  /**
   * Triggered when a speech recognition result has been received from ASR.
   * 
   * We strongly recommend to create recognition timeout manually to prevent unexpectedly long recognition time.  
   * Note: We recommend to take a decision about continuing speech recognition in this event's handler. Otherwise, speech recognition continues automatically.
   * @typedef _ASRResultEvent
   */
  Result = 'ASR.Result',
  /**
   * Triggered when interim recognition result received from ASR. Note that event could be triggered only if the [ASRParameters.interimResults] option is set to **true**.
   * @typedef _ASRInterimResultEvent
   */
  InterimResult = 'ASR.InterimResult',
  /**
   * Triggers as a result of the [ASR.stop] method call.
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
declare interface _ASRErrorEvent extends _ASREvent {
  /**
   * Error message
   */
  error: string;
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
   * Optional. Time offset of the end of this result relative to the beginning of the audio.
   */
  resultEndTime?: string | number;
  /**
   * Optional. For multichannel audio, this is the channel number corresponding to the recognized result for the audio from that channel.
   */
  channelTag?: number;
  /**
   * Optional. Output only. The BCP-47 language tag of the language in this result. This language code is detected to have the most likelihood of being spoken in the audio.
   */
  languageCode?: string;
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
 * List of available languages for ASR.
 * <br>
 * Note that the T-Bank VoiceKit and Yandex Speechkit supports only 'ASRLanguage.RUSSIAN_RU' language.
 * <br>
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.ASR);
 * ```
 * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
 */
declare enum ASRLanguage {
  /**
   * English (United States)
   * @const
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_US = 'en-US',
  /**
   * English (Canada)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_CA = 'en-CA',
  /**
   * English (United Kingdom)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_UK = 'en-GB',
  /**
   * English (Australia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_AU = 'en-AU',
  /**
   * Spanish (Spain)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_ES = 'es-ES',
  /**
   * Spanish (Mexico)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_MX = 'es-MX',
  /**
   * Italian (Italy)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ITALIAN_IT = 'it-IT',
  /**
   * French (France)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FRENCH_FR = 'fr-FR',
  /**
   * French (Canada)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FRENCH_CA = 'fr-CA',
  /**
   * Polish (Poland)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  POLISH_PL = 'pl-PL',
  /**
   * Portuguese (Portugal)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  PORTUGUES_PT = 'pt-PT',
  /**
   * Catalan (Catalan)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CATALAN_ES = 'ca-ES',
  /**
   * Chinese (Taiwan)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CHINESE_TW = 'cmn-Hant-TW',
  /**
   * Danish (Denmark)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  DANISH_DK = 'da-DK',
  /**
   * German (Germany)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GERMAN_DE = 'de-DE',
  /**
   * Finnish (Finland)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FINNISH_FI = 'fi-FI',
  /**
   * Japanese (Japan)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  JAPANESE_JP = 'ja-JP',
  /**
   * Korean (Korea)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  KOREAN_KR = 'ko-KR',
  /**
   * Dutch (Netherlands)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  DUTCH_NL = 'nl-NL',
  /**
   * Norwegian (Norway)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  NORWEGIAN_NO = 'nb-NO',
  /**
   * Portuguese (Brazil)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  PORTUGUESE_BR = 'pt-BR',
  /**
   * Russian (Russia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  RUSSIAN_RU = 'ru-RU',
  /**
   * Swedish (Sweden)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SWEDISH_SE = 'sv-SE',
  /**
   * Chinese (People's Republic of China)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CHINESE_CN = 'cmn-Hans-CN',
  /**
   * Chinese (Hong Kong S.A.R.)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CHINESE_HK = 'cmn-Hans-HK',
  /**
   * Afrikaans (South Africa)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  AFRIKAANS_ZA = 'af-ZA',
  /**
   * Indonesian (Indonesia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  INDONESIAN_ID = 'id-ID',
  /**
   * Malay (Malaysia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  MALAYSIA_MY = 'ms-MY',
  /**
   * Czech (Czech Republic)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CZECH_CZ = 'cs-CZ',
  /**
   * English (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_IN = 'en-IN',
  /**
   * English (Ireland)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_IE = 'en-IE',
  /**
   * English (New Zealand)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_NZ = 'en-NZ',
  /**
   * English (Philippines)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_PH = 'en-PH',
  /**
   * English (South Africa)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_ZA = 'en-ZA',
  /**
   * Spanish (Argentina)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_AR = 'es-AR',
  /**
   * Spanish (Bolivia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_BO = 'es-BO',
  /**
   * Spanish (Chile)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_CL = 'es-CL',
  /**
   * Spanish (Colombia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_CO = 'es-CO',
  /**
   * Spanish (Costa Rica)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_CR = 'es-CR',
  /**
   * Spanish (Ecuador)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_EC = 'es-EC',
  /**
   * Spanish (El Salvador)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_SV = 'es-SV',
  /**
   * Spanish (United States)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_US = 'es-US',
  /**
   * Spanish (Guatemala)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_GT = 'es-GT',
  /**
   * Spanish (Honduras)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_HN = 'es-HN',
  /**
   * Spanish (Nicaragua)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_NI = 'es-NI',
  /**
   * Spanish (Panama)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PA = 'es-PA',
  /**
   * Spanish (Paraguay)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PY = 'es-PY',
  /**
   * Spanish (Peru)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PE = 'es-PE',
  /**
   * Spanish (Puerto Rico)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_PR = 'es-PR',
  /**
   * Spanish (Republican Dominican)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_DO = 'es-DO',
  /**
   * Spanish (Uruguay)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_UY = 'es-UY',
  /**
   * Spanish (Venezuela)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SPANISH_VE = 'es-VE',
  /**
   * Basque (Spain)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BASQUE_ES = 'eu-ES',
  /**
   * Filipino (Philippines)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FILIPINO_PH = 'fil-PH',
  /**
   * Galician (Spain)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GALICIAN_ES = 'gl-ES',
  /**
   * Croatian (Croatia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CROATIAN_HR = 'hr-HR',
  /**
   * Zulu (South Africa)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ZULU_ZA = 'zu-ZA',
  /**
   * Icelandic (Iceland)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ICELANDIC_IS = 'is-IS',
  /**
   * Lithuanian (Lithuania)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  LITHUANIAN_LT = 'lt-LT',
  /**
   * Hungarian (Hungary)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  HUNGARIAN_HU = 'hu-HU',
  /**
   * Romanian (Romania)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ROMANIAN_RO = 'ro-RO',
  /**
   * Slovak (Slovakia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SLOVAK_SK = 'sk-SK',
  /**
   * Slovenian (Slovenia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SLOVENIAN_SL = 'sl-SI',
  /**
   * Vietnamese (Viet Nam)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  VIETNAMESE_VN = 'vi-VN',
  /**
   * Turkish (Turkiye)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TURKISH_TR = 'tr-TR',
  /**
   * Greek (Greece)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GREEK_GR = 'el-GR',
  /**
   * Bulgarian (Bulgaria)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BULGARIAN_BG = 'bg-BG',
  /**
   * Serbian
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SERBIAN_RS = 'sr-RS',
  /**
   * Ukrainian (Ukraine)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  UKRAINIAN_UA = 'uk-UA',
  /**
   * Hebrew (Israel)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  HEBREW_IL = 'he-IL',
  /**
   * Arabic (Israel)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_IL = 'ar-IL',
  /**
   * Arabic (Jordan)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_JO = 'ar-JO',
  /**
   * Arabic (U.A.E.)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_AE = 'ar-AE',
  /**
   * Arabic (Bahrain)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_BH = 'ar-BH',
  /**
   * Arabic (Algeria)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_DZ = 'ar-DZ',
  /**
   * Arabic (Saudi Arabia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_SA = 'ar-SA',
  /**
   * Arabic (Iraq)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_IQ = 'ar-IQ',
  /**
   * Arabic (Kuwait)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_KW = 'ar-KW',
  /**
   * Arabic (Morocco)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_MA = 'ar-MA',
  /**
   * Arabic (Tunisia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_TN = 'ar-TN',
  /**
   * Arabic (Oman)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_OM = 'ar-OM',
  /**
   * Arabic (Palestinian)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_PS = 'ar-PS',
  /**
   * Arabic (Qatar)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_QA = 'ar-QA',
  /**
   * Arabic (Lebanon)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_LB = 'ar-LB',
  /**
   * Arabic (Egypt)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARABIC_EG = 'ar-EG',
  /**
   * Farsi (Iran)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  FARSI_IR = 'fa-IR',
  /**
   * Hindi (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  HINDI_IN = 'hi-IN',
  /**
   * Thai (Thailand)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  THAI_TH = 'th-TH',
  /**
   * Cantonese, Traditional script, Hong Kong SAR
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  CANTONESE_HK = 'yue-Hant-HK',
  /**
   * Amharic (Ethiopia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  AMHARIC_ET = 'am-ET',
  /**
   * Armenian (Armenia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ARMENIAN_AM = 'hy-AM',
  /**
   * Azerbaijani (Azerbaijan)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  AZERBAIJANI_AZ = 'az-AZ',
  /**
   * Bengali (Bangladesh)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BENGALI_BD = 'bn-BD',
  /**
   * Bengali (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  BENGALI_IN = 'bn-IN',
  /**
   * English (Ghana)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_GH = 'en-GH',
  /**
   * English (Kenya)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_KE = 'en-KE',
  /**
   * English (Nigeria)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_NG = 'en-NG',
  /**
   * English (Tanzania)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  ENGLISH_TZ = 'en-TZ',
  /**
   * Georgian (Georgia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GEORGIAN_GE = 'ka-GE',
  /**
   * Gujarati (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  GUJARATI_IN = 'gu-IN',
  /**
   * Javanese (Indonesia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  JAVANESE_ID = 'jv-ID',
  /**
   * Kannada (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  KANNADA_IN = 'kn-IN',
  /**
   * Khmer (Cambodia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  KHMER_KH = 'km-KH',
  /**
   * Lao (Laos)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  LAO_LA = 'lo-LA',
  /**
   * Latvian (Latvia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  LATVIAN_LV = 'lv-LV',
  /**
   * Malayalam (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  MALAYALAM_IN = 'ml-IN',
  /**
   * Marathi (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  MARATHI_IN = 'mr-IN',
  /**
   * Nepali (Nepal)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  NEPALI_NP = 'ne-NP',
  /**
   * Sinhala (Srilanka)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SINHALA_LK = 'si-LK',
  /**
   * Sundanese (Indonesia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SUNDANESE_ID = 'su-ID',
  /**
   * Swahili (Tanzania)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SWAHILI_TZ = 'sw-TZ',
  /**
   * Swahili (Kenya)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  SWAHILI_KE = 'sw-KE',
  /**
   * Tamil (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_IN = 'ta-IN',
  /**
   * Tamil (Singapore)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_SG = 'ta-SG',
  /**
   * Tamil (Sri Lanka)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_LK = 'ta-LK',
  /**
   * Tamil (Malaysia)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TAMIL_MY = 'ta-MY',
  /**
   * Telugu (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  TELUGU_IN = 'te-IN',
  /**
   * Urdu (Pakistan)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  URDU_PK = 'ur-PK',
  /**
   * Urdu (India)
   * @warning Use [ASRLanguage] for [RecorderParameters] 'language' parameter. For [ASRParameters] 'profile' parameter use [ASRProfileList] instead.
   */
  URDU_IN = 'ur-IN',
}

/**
 * List of available models for [ASR].
 * <br>
 * Note that T-Bank VoiceKit supports only **PHONE_CALL** model.
 * <br>
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.ASR);
 * ```
 * @deprecated For [ASRParameters] **model** parameter use [ASRModelList] instead.
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
 * @private
 */
declare interface BaseRecorderParameters {
  /**
   * Optional. Whether to restrict access to the record without management API authorization (available only in the [VoxEngine.createRecorder] method).
   */
  secure?: boolean;
  /**
   * Optional. Whether to create the call record transcription. Note that transcription is not available for the [Recorder module](/docs/references/voxengine/modules#recorder). See the details [in the article](/docs/guides/speech/asr).
   */
  transcribe?: boolean;
  /**
   * Optional. Transcription language. The parameter uses [ASRLanguage] from the [ASR module](/docs/references/voxengine/modules#asr) as possible values. Note that it is necessary to include the [ASR module](/docs/references/voxengine/modules#asr) in the scenario to use the language constants. The parameter is not available for the [Recorder module](/docs/references/voxengine/modules#recorder).
   */
  language?: ASRLanguage;
  /**
   * Optional. Whether to use the HD audio. The default value is **false**. If set to **false**, 8 KHz / 32 kbps mp3 file is generated. If set to **true**, "wideband audio" 48 KHz / 192 kbps mp3 file is generated. Note that transcription's quality does not depend on this parameter. The parameter is not compatible with **lossless: true** parameter.
   */
  hd_audio?: boolean;
  /**
   * Optional. Storage time for recorded files. The default value is **[RecordExpireTime.THREEMONTHS]**.
   */
  expire?: RecordExpireTime;
  /**
   * Optional. Whether to save the record in flac format. The default value is **false**. The parameter is not compatible with **hd_audio: true** parameter.
   */
  lossless?: boolean;
  /**
   * Optional. Whether to record video. The default value is **false**.
   */
  video?: boolean;
  /**
   * Optional. Recorder video parameters.
   */
  videoParameters?: RecorderVideoParameters;
  /**
   * Optional. The prefix to add to the record names when storing to your S3 storage. Works only for custom S3-compatible storages.
   */
  recordNamePrefix?: string;
}

/**
 * The parameters can be passed as arguments to the [Call.answer] method.
 */
declare interface CallAnswerParameters extends CallParameters {}

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
   * Triggers when [voicemail detection](/docs/guides/calls/voicemail-detection) system connects to the VMD/AMD server and starts detecting voicemail.
   * @typedef _AudioIdentificationStartedEvent
   * */
  AudioIdentificationStarted = 'Call.AudioIdentificationStarted',
  /**
   * Triggers when [voicemail detection](/docs/guides/calls/voicemail-detection) ends detecting voicemail and the audio identification result is received.
   * @typedef _AudioIdentificationResultEvent
   * @hidden
   */
  AudioIdentificationResult = 'Call.AudioIdentificationResult',
  /**
   * Triggers when [voicemail detection](/docs/guides/calls/voicemail-detection) stops detecting voicemail.
   * @typedef _AudioIdentificationStoppedEvent
   * */
  AudioIdentificationStopped = 'Call.AudioIdentificationStopped',
  /**
   * Triggers when [voicemail detection](/docs/guides/calls/voicemail-detection) occurs an error.
   * @typedef _AudioIdentificationErrorEvent
   */
  AudioIdentificationError = 'Call.AudioIdentificationError',
  /**
   * Triggered when blind transfers are enabled by [Call.handleBlindTransfer].
   * @typedef _BlindTransferRequestedEvent
   */
  BlindTransferRequested = 'Call.BlindTransferRequested',
  /**
   * Triggers after an incoming/outgoing call is connected. For incoming call, it happens after the [Call.answer] is called. For outgoing call, it happens when a remote peer answers the call.
   * @typedef _ConnectedEvent
   */
  Connected = 'Call.Connected',
  /**
   * Triggers on an incoming/outgoing call forwarding.
   * @typedef _ForwardingEvent
   */
  Forwarding = 'Call.Forwarding',
  /**
   * Triggered when a call is terminated.
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
   * Triggered when an outgoing call is terminated before connection.
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
   * Triggered when an INFO message is received.
   * @typedef _InfoReceivedEvent
   */
  InfoReceived = 'Call.InfoReceived',
  /**
   * Triggered when a text message is received.
   * @typedef _MessageReceivedEvent
   */
  MessageReceived = 'Call.MessageReceived',
  /**
   * Triggers each time when microphone status changes. There is the method for enabling status analyzing - [Call.handleMicStatus].
   * @typedef _MicStatusChangeEvent
   * */
  MicStatusChange = 'Call.MicStatusChange',
  /**
   * Triggered when a call is taken off hold.
   * @typedef _OffHoldEvent
   */
  OffHold = 'Call.OffHold',
  /**
   * Triggered when a call is put on hold.
   * @typedef _OnHoldEvent
   */
  OnHold = 'Call.OnHold',
  /**
   * Triggered when the audio/voice playback is completed.
   * Note that the [Call.stopPlayback] method finishes any media, so the PlaybackFinished event is not triggered. The playback may be started by the [Call.say] or [Call.startPlayback] methods.
   * @typedef _PlaybackFinishedEvent
   */
  PlaybackFinished = 'Call.PlaybackFinished',
  /**
   * Triggers by the [Call.startPlayback] and [Call.say] methods when:<br>
   * 1) the audio file download to the Voximplant cache is finished;<br>
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
   * Triggered when a push notification is sent.
   * @typedef _PushSentEvent
   */
  PushSent = 'Call.PushSent',
  /**
   * Triggered when the Voximplant cloud receives the ReInviteAccepted message. This message means that a call received video from the other participant.
   * @typedef _ReInviteAcceptedEvent
   */
  ReInviteAccepted = 'Call.ReInviteAccepted',
  /**
   * Triggered when the Voximplant cloud receives the ReInviteReceived message. This message means that a caller:<br>
   * 1) started sending video;<br>
   * 2) started/stopped screensharing;<br>
   * 3) put a call on hold / took a call off hold.
   * @typedef _ReInviteReceivedEvent
   */
  ReInviteReceived = 'Call.ReInviteReceived',
  /**
   * Triggered when the Voximplant cloud receives the ReInviteRejected message. This message means that a call does not receive video from the other participant.
   * @typedef _ReInviteRejectedEvent
   */
  ReInviteRejected = 'Call.ReInviteRejected',
  /**
   * Triggers in case of errors during the recording process.
   * @typedef _RecordErrorEvent
   */
  RecordError = 'Call.RecordError',
  /**
   * Triggered when call recording is started as a result of the [Call.record] method call.
   * @typedef _RecordStartedEvent
   */
  RecordStarted = 'Call.RecordStarted',
  /**
   * Triggered when call recording is stopped. This happens after the [CallEvents.Disconnected] event is triggered.
   * @typedef _RecordStoppedEvent
   */
  RecordStopped = 'Call.RecordStopped',
  /**
   * Triggers after outgoing call receives progress signal from a remote peer.
   * @typedef _RingingEvent
   */
  Ringing = 'Call.Ringing',
  /**
   * Triggered when a call status is changed.
   * @typedef _StateChangedEvent
   */
  StateChanged = 'Call.StateChanged',
  /**
   * Triggered when call statistic changed.
   * @deprecated
   * @typedef _StatisticsEvent
   */
  Statistics = 'Call.Statistics',
  /**
   * Triggered when a call dial tone is detected (either dial tone or busy tone).
   * There is the deprecated method for enabling the tone detection - 'Call.detectProgressTone'. Note that:<br>
   * 1) triggers only if the [CallEvents.Connected] event is triggered;<br>
   * 2) the event is only triggered once in a call session.
   * @typedef _ToneDetectedEvent
   */
  ToneDetected = 'Call.ToneDetected',
  /**
   * Triggered when a DTMF signal is received. Note that by default DTMF signals do not trigger this event, this behavior needs to be set explicitly via the [Call.handleTones] method.
   * @typedef _ToneReceivedEvent
   */
  ToneReceived = 'Call.ToneReceived',
  /**
   * Triggered when a call transfer is complete.
   * @typedef _TransferCompleteEvent
   */
  TransferComplete = 'Call.TransferComplete',
  /**
   * Triggered when a call transfer is failed.
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
   * @typedef _FirstAudioPacketReceivedEvent
   */
  FirstAudioPacketReceived = 'Call.FirstAudioPacketReceived',
  /**
   * Triggers after the first video packet is received.
   * @typedef _FirstVideoPacketReceivedEvent
   */
  FirstVideoPacketReceived = 'Call.FirstVideoPacketReceived',
  /**
   * Triggers after the RTP stopped.
   * @typedef _RtpStoppedEvent
   */
  RtpStopped = 'Call.RtpStopped',
  /**
   * Triggers after the RTP resumed.
   * @typedef _RtpResumedEvent
   */
  RtpResumed = 'Call.RtpResumed',
}

/**
 * @private
 */
declare interface _CallEvents {
  [CallEvents.AudioStarted]: _AudioStartedEvent;
  [CallEvents.AudioIdentificationStarted]: _AudioIdentificationStartedEvent;
  [CallEvents.AudioIdentificationResult]: _AudioIdentificationResultEvent;
  [CallEvents.AudioIdentificationStopped]: _AudioIdentificationStoppedEvent;
  [CallEvents.AudioIdentificationError]: _AudioIdentificationErrorEvent;
  [CallEvents.BlindTransferRequested]: _BlindTransferRequestedEvent;
  [CallEvents.Connected]: _ConnectedEvent;
  [CallEvents.Forwarding]: _ForwardingEvent;
  [CallEvents.Disconnected]: _DisconnectedEvent;
  [CallEvents.Failed]: _FailedEvent;
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
  [CallEvents.FirstAudioPacketReceived]: _FirstAudioPacketReceivedEvent;
  [CallEvents.FirstVideoPacketReceived]: _FirstVideoPacketReceivedEvent;
  [CallEvents.RtpStopped]: _RtpStoppedEvent;
  [CallEvents.RtpResumed]: _RtpResumedEvent;
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
   * Optional. SIP headers received with the message (the ones starting with "X-")
   */
  headers?: { [header: string]: string };
}

/**
 * @private
 */
declare interface _AudioStartedEvent extends _CallHeaderEvent {
}

/**
 * @private
 */
declare interface _AudioIdentificationStartedEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _AudioIdentificationResultEvent extends _CallEvent {
  audioType: AMD.ResultClass;
  audioSubType: AMD.ResultSubtype;
  confidence: number;
}

/**
 * @private
 */
declare interface _AudioIdentificationStoppedEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _AudioIdentificationErrorEvent extends _CallEvent {
}

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
   * Optional. Custom data that was passed from the client with call accept command
   */
  customData?: string;
  /**
   * Optional. SIP headers received with the message (the ones starting with "X-")
   */
  headers: { [header: string]: string };
}

/**
 * @private
 */
declare interface _ForwardingEvent extends _CallEvent {
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
declare interface _OffHoldEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _OnHoldEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _PlaybackFinishedEvent extends _CallEvent {
  /**
   * Optional. Error that occurred during the playback
   */
  error?: string;
}

/**
 * @private
 */
declare interface _PlaybackReadyEvent extends _CallEvent {
}

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
declare interface _ReInviteAcceptedEvent extends _CallReInviteEvent {
}

/**
 * @private
 */
declare interface _ReInviteReceivedEvent extends _CallReInviteEvent {
}

/**
 * @private
 */
declare interface _ReInviteRejectedEvent extends _CallHeaderEvent {
}

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
declare interface _RingingEvent extends _CallHeaderEvent {
}

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
declare interface _StatisticsEvent extends _CallEvent {
}

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
   * Optional. The transfer roles.
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
declare interface _VideoTrackCreatedEvent extends _CallRecordEvent {
}

/**
 * @private
 */
declare interface _FirstAudioPacketReceivedEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _FirstVideoPacketReceivedEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _RtpStoppedEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface _RtpResumedEvent extends _CallEvent {
}

/**
 * @private
 */
declare interface CallParameters {
  /**
   * Optional. Name of the caller that is displayed to the user. Normally it is a human-readable version of CallerID, e.g. a person's name.
   */
  displayName?: string;
  /**
   * Optional. Internal information about codecs from the [AppEvents.CallAlerting] event.
   */
  scheme?: { [id: string]: { audio: any, video: any } };
  /**
   * Optional. Sets the maximum possible video bitrate for the customer device in kbps.
   */
  maxVideoBitrate?: number;
  /**
   * Optional. Whether to disable the RTP header extension for transmission offset if provided.
   */
  disableExtVideoOffset?: boolean;
  /**
   * Optional. Whether to disable the RTP header extension for video orientation, **3gpp:video-orientation**, if provided. Browsers that do not support that extension display the video correctly, however, the battery consumption is higher.
   */
  disableExtVideoOrientation?: boolean;
  /**
   * Optional. Whether to disable the RTP header extension to control playout delay if provided.
   */
  disableExtPlayoutDelay?: boolean;
  /**
   * Optional. Whether to disable the RTP header extension for video timing if provided.
   */
  disableExtVideoTiming?: boolean;
  /**
   * Optional. Whether the call is coming from a conference. The default value is **false**.
   */
  conferenceCall?: boolean;
}

/**
 * [Call] parameters. Can be passed as arguments to the [VoxEngine.callPSTN] method.
 */
declare interface CallPSTNParameters {
  /**
   * Optional. Answering machine or voicemail detector.
   */
  amd?: AMD.AnsweringMachineDetector;
  /**
   * Optional. Whether to use the inbound caller ID for the outbound call from the scenario. The default value is false.
   */
  followDiversion?: boolean;
}

/**
 * The parameters can be passed as arguments to the [Call.record] method.
 */
declare interface CallRecordParameters extends BaseRecorderParameters {
  /**
   * Optional. Whether the sound is stereo. The default value is **false**. The parameter does not change anything for the [Recorder module](/docs/references/voxengine/modules#recorder): it records stereo with mixed streams in both channels. For the [Call.record] method it works in another way:  1) if it is False, it records stereo with mixed streams in both channels  2) If it is True, the Audio stream from a call endpoint to voximplant cloud is recorded into right channel. Audio stream from voximplant cloud to a call endpoint is recorded into left channel.
   */
  stereo?: boolean;
  /**
   * Optional. Transcription dictionary. Array of words that are possible values. Note that dict does not limit the transcription to the specific list. Instead, words in the specified list have a higher chance to be selected. Note that the parameter does not affect the [Recorder module](/docs/references/voxengine/modules#recorder) because the transcription is not available for it.
   */
  dict?: ASRDictionary | string[];
  /**
   * Optional. An array of two strings. Each string names the label in resulting transcription: the first string names a call/stream that initiated recording, the second string names the other call. If there is only one string in the array or the parameter is not specified at all, the recording's initiate call has the "Left" name and the second stream has the "Right" name. The parameter requires the **transcribe: true** parameter. The parameter is not available for the [Recorder module](/docs/references/voxengine/modules#recorder).
   */
  labels?: string[];
  /**
   * Optional. Transcription provider.
   */
  provider?: TranscriptionProvider;
  /**
   * Optional. Transcription format. Could be specified as "json". In that case the transcription result is saved in JSON format. The parameter is not available for the [Recorder module](/docs/references/voxengine/modules#recorder).
   */
  format?: string;
}

/**
 * The parameters can be passed as arguments to the [Call.say] method.
 */
declare interface CallSayParameters {
  /**
   * Optional. Language and voice for TTS. List of all supported voices: [VoiceList]. The default value is **VoiceList.Amazon.en_US_Joanna**.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank, Yandex.*
   */
  language?: Voice;
  /**
   * Optional. Whether to use progressive playback. If true, the generated speech is delivered in chunks which reduces delay before a method call and playback. The default value is **false**.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank, Yandex.*
   */
  progressivePlayback?: boolean;
  /**
   * Optional. Parameters for TTS. Note that support of the [TTSOptions.pitch] parameter depends on the language and dictionary used. For unsupported combinations the [CallEvents.PlaybackFinished] event is triggered with error 400.<br><br>*Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank, Yandex.*
   */
  ttsOptions?: TTSOptions;
  /**
   * Optional. Provide the TTS parameters directly to the provider in this parameter. Find more information in the <a href="/docs/guides/speech/tts#passing-parameters-directly-to-the-provider">documentation</a>.<br><br>*Available for providers: Google, SaluteSpeech, T-Bank, YandexV3.*
   */
  request?: Object;
}

/**
 * [Call] parameters. Can be passed as arguments to the [VoxEngine.callSIP] method.
 */
declare interface CallSIPParameters {
  /**
   * Optional. Identifier of Voximplant SIP registration that is used for outgoing call.
   */
  regId?: number;
  /**
   * Optional. CallerID of the caller that is displayed to the callee. Usage of whitespaces is not allowed. Normally it is a phone number that can be used for callback.
   */
  callerid?: string;
  /**
   * Optional. Name of the caller that is displayed to the callee. Normally it is a human-readable version of CallerID, e.g. a person's name.
   */
  displayName?: string;
  /**
   * Optional. Password for SIP authentication.
   */
  password?: string;
  /**
   * Optional. Username for SIP authentication. If not specified, callerid is used as the username for authentication.
   */
  authUser?: string;
  /**
   * Optional. Custom parameters (SIP headers) that should be passed with a call (INVITE) message.
   * Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK
   * (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  headers?: Object;
  /**
   * Optional. Whether the call has video support. Please note that the price for audio-only and video calls is different!
   */
  video?: boolean;
  /**
   * Optional. Outgoing proxy, e.g. "69.167.178.6"
   */
  outProxy?: string;
  /**
   * Optional. Answering machine or voicemail detector.
   */
  amd?: AMD.AnsweringMachineDetector;
}

/**
 * [Call] parameters. Can be passed as arguments to the [VoxEngine.callUserDirect] method.
 */
declare interface CallUserDirectParameters {
  /**
   * CallerID to display to the callee. Usage of whitespaces is not allowed. Normally it is a phone number that can be used for callback. IMPORTANT: test numbers rented from Voximplant cannot be used as CallerIDs, use only real numbers.
   */
  callerid: string;
  /**
   * Name of the caller that is displayed to the callee. Normally it is a human-readable version of CallerID, e.g. a person's name.
   */
  displayName: string;
  /**
   * Optional. Send custom tags along with the push notification of an incoming call.
   */
  analyticsLabel?: string;
  /**
   * Optional. Custom parameters (SIP headers) to be passed with a call (INVITE) message. Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  extraHeaders?: { [header: string]: string };
  /**
   * Optional. Push notification timeout in milliseconds. Note that the timeout is only triggered after the [CallEvents.Failed] event with *480 User Offline*. The default value is **20000**. Must not be less than **10000** or greater than **60000**.
   */
  pushNotificationTimeout?: number;
}

/**
 * [Call] parameters. Can be passed as arguments to the [VoxEngine.callUser] method.
 */
declare interface CallUserParameters extends CallParameters {
  /**
   * Name of the Voximplant user to call.
   */
  username: string;
  /**
   * CallerID to display to the callee. Usage of whitespaces is not allowed. Normally it is a phone number that can be used for callback. IMPORTANT: test numbers rented from Voximplant cannot be used as CallerID, use only real numbers.
   */
  callerid: string;
  /**
   * Optional. Custom parameters (SIP headers) that should be passed with a call (INVITE) message. Custom header names have to begin with the 'X-' prefix except the 'VI-CallTimeout': '60' which hangs up if there is no answer after the timeout (in seconds, the default value is **60**, must not be less than **10** or greater than **400**). The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}.
   */
  extraHeaders?: { [header: string]: string };
  /**
   * Optional. Whether the call has video support. Please note that prices for audio-only and video calls are different!
   */
  video?: boolean;
  /**
   * Optional. Whether to send an RTP extension header to communicate video orientation information (`a=extmap:12 urn:3gpp:video-orientation`). If **false**, browsers that do not support that extension are correctly displaying video; however, the battery consumption is higher. The default value is **true**.
   */
  videoOrientationExtension?: boolean;
  /**
   * Optional. Sends custom tags along with the push notification of an incoming call.
   */
  analyticsLabel?: string;
  /**
   * Optional. Answering machine or voicemail detector.
   */
  amd?: AMD.AnsweringMachineDetector;
  /**
   * Optional. Push notification timeout in milliseconds. Note that the timeout is only triggered after the [CallEvents.Failed] event with *480 User Offline*. The default value is **20000**. Must not be less than **10000** or greater than **60000**.
   */
  pushNotificationTimeout?: number;
}

/**
 * Represents an audio or video call.
 */
declare class Call {
  /**
   * Returns the current state of the call. Possible values are: **TERMINATED** | **CONNECTED** | **PROGRESSING** | **ALERTING**.
   */
  state(): string;

  /**
   * Returns the human-readable description of the call's status.
   */
  toString(): string;

  /**
   * Sets or gets a custom string associated with the particular call (the Call object). The **customData** value could be sent from WEB/iOS/Android SDKs, and then it becomes the **customData** value in the [Call] object. Note that if you receive a value from an SDK, you can always replace it manually.
   * SDKs can pass customData in two ways:<br>
   * 1) when SDK calls the Voximplant cloud</br>
   * 2) when SDK answers the call from the Voximplant cloud. See the syntax and details in the corresponding references: [WEB SDK call()](/docs/references/websdk/voximplant/client#call) / [WEB SDK answer()](/docs/references/websdk/voximplant/call#answer) / [iOS call:settings:](/docs/references/iossdk/client/viclient#callsettings) / [iOS answerWithSettings](/docs/references/iossdk/call/vicall#answerwithsettings:) / [Android call()](/docs/references/androidsdk/client/iclient#call) / [Android answer()](/docs/references/androidsdk/call/icall#answer)
   * @param customData Optional. Custom call data to set. Maximum size is **200 bytes**
   */
  customData(customData?: string): string;

  /**
   * Returns the call's id. Each call in a JavaScript session has its own unique id.
   */
  id(): string;

  /**
   * Whether the call is incoming.
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
   * Returns a dialed number of the incoming or outgoing call.
   */
  number(): string;

  /**
   * Returns VAD (Voice Activity Detection) status. The including of the ASR also activates VAD so in that case vad() returns true.
   */
  vad(): boolean;

  /**
   * Adds a handler for the specified [CallEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [CallEvents.Connected])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _CallEvents>(
    event: CallEvents | T,
    callback: (event: _CallEvents[T]) => any,
  ): void;

  /**
   * Removes a handler for the specified [CallEvents] event.
   * @param event Event class (i.e., [CallEvents.Connected])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _CallEvents>(
    event: CallEvents | T,
    callback?: (event: _CallEvents[T]) => any,
  ): void;

  /**
   * Returns a type of the client.
   */
  clientType(): string;

  /**
   * Attempts finishing the current call. Triggers one of the following events:
   * 1. [CallEvents.Disconnected] if the call is active before hangup.
   * 2. [CallEvents.Failed] if it is an outgoing call that is not connected previously.
   * <br>
   * If there are no other active calls and/or SmartQueue requests in the call session, the [AppEvents.Terminating] and [AppEvents.Terminated] events are triggered in 60 seconds (see the [session limits](/docs/guides/voxengine/limits) for details).
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the hangup request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  hangup(extraHeaders?: { [header: string]: string }): void;

  /**
   * Answers the incoming call. Use it only for non-P2P call legs connection. Remember that you can use the [Call.startEarlyMedia] method before answering a call.
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the answer request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [Connected](/docs/references/websdk/voximplant/callevents#connected) event). Example: {'X-header':'value'}
   * @param parameters Optional. Answering call parameters
   */
  answer(extraHeaders?: { [header: string]: string }, parameters?: CallAnswerParameters): void;

  /**
   * Answer the incoming call in the peer-to-peer mode. Use it only for P2P call legs connection.
   * @param peerCall The other P2P call leg.
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the answer request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the  Connected (/docs/references/websdk/enums/callevents.html#connected) event). Example: {'X-header':'value'}
   * @param parameters Optional. Answering call parameters
   */
  answerDirect(
    peerCall: Call,
    extraHeaders?: { [header: string]: string },
    parameters?: CallAnswerParameters,
  ): void;

  /**
   * Rejects the incoming call.
   * @param code SIP status code
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the reject request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g., see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   * @deprecated Use [Call.reject] instead
   */
  decline(code: number, extraHeaders?: { [header: string]: string }): void;

  /**
   * Rejects the incoming call. First it triggers the [CallEvents.Disconnected] event immediately. The [AppEvents.Terminating] and [AppEvents.Terminated] events are triggered in 60 seconds.
   * @param code SIP status code with the rejection reason. You can pass any [standard SIP code](https://en.wikipedia.org/wiki/List_of_SIP_response_codes) starting with 3xx, 4xx, 5xx and 6xx as a reject reason.
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the reject request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  reject(code: number, extraHeaders?: { [header: string]: string }): void;

  /**
   * Plays dial tones for the incoming call. The method sends a low-level command to the endpoint device to start playing dial tones for the call. So the dial tones depend on endpoint device's behavior rather than on the Voximplant cloud. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new incoming stream always replaces the previous one.
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  ring(extraHeaders?: { [header: string]: string }): void;

  /**
   * Informs the call endpoint that early media is sent before accepting the call. It allows playing voicemail prompt or music before establishing the connection. It does not allow to listen to call endpoint. Note that unanswered call can be in "early media" state only for 60 seconds, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param extraHeaders Optional. Custom parameters (SIP headers) that should be passed with the request. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   * @param scheme Optional. Internal information about codecs from the [AppEvents.CallAlerting] event
   * @param maxVideoBitrate Optional. Set the maximum possible video bitrate for the customer device in kbps
   * @param audioLevelExtension Optional. Audio level extension
   * @param conferenceCall Optional. Whether the call is coming from a conference. The default value is **false**
   */
  startEarlyMedia(
    extraHeaders?: { [header: string]: string },
    scheme?: string,
    maxVideoBitrate?: number,
    audioLevelExtension?: boolean,
    conferenceCall?: boolean,
  ): void;

  /**
   * Starts to play an audio file to the answered call. You can stop playback manually via the [Call.stopPlayback] method. You can attach media streams later via the [Call.sendMediaTo] method etc. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new incoming stream always replaces the previous one.
   * @param url HTTP/HTTPS url to the audio file. The file is cached after the first playing. Supported formats are: mp3, ogg, flac, and wav (mp3, speex, vorbis, flac, and wav codecs respectively). Maximum file size is 10 Mb
   * @param parameters Optional. Playback parameters
   */
  startPlayback(url: string, parameters?: StartPlaybackParameters): void;

  /**
   * Say some text to the [CallEvents.Connected] call. If text length exceeds 1500 characters the [PlayerEvents.PlaybackFinished] event is triggered with error description.
   * IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new incoming stream always replaces the previous one.
   * @param text Message that is played to the call. To put an accent to the specified syllable, use the <say-as stress='1'></say-as> tag
   * @param parameters Optional. TTS parameters
   * @warning This method internally operates with the [Player] class and its events. Use the [VoxEngine.createTTSPlayer] to get more flexibility
   */
  say(text: string, parameters?: CallSayParameters): void;

  /**
   * Starts recording the incoming and outgoing audio for this call.
   * This method triggers the [CallEvents.RecordStarted] event.
   * The default quality is **8kHz / 32kbps**; the format is **mp3**.
   * @param parameters Recorder parameters
   */
  record(parameters: CallRecordParameters): void;

  /**
   * Stops audio playback started before via the [Call.startPlayback] method.
   */
  stopPlayback(): void;

  /**
   * Provides country-specific dial tones. The method sends a command to the Voximplant cloud to start playing dial tones in the call. The dial tones fully depend on the Voximplant cloud. Note that in order to work properly in a call that is not connected yet, you need to call the [Call.startEarlyMedia] method before using this function. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new incoming stream always replaces the previous one.
   * @param country 2-letter country code. Currently supported values are **US**, **RU**
   */
  playProgressTone(country: string): void;

  /**
   * Sends a text message to the call.
   * @param text Message text. Maximum size is **8192 bytes** according to the limits
   */
  sendMessage(text: string): void;

  /**
   * Starts sending media (voice and video) from the call to the media unit. The target call has to be [CallEvents.Connected] earlier. IMPORTANT: each call object can send media to any number of the media units, but can receive only one audio stream. A new incoming stream always replaces the previous one.
   * @param mediaUnit Media unit that receives media
   * @param parameters Optional. WebSocket interaction only parameters
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

  /**
   * Stops sending media (voice and video) from the call to media unit.
   * @param mediaUnit Media unit that does not need to receive media from this call anymore
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;

  /**
   * Changes DTMF processing mode (in-band DTMF, RFC 2833 DTMF and DTMF over SIP INFO) telephony signals. If true, each received DTMF signal triggers the [CallEvents.ToneReceived] and removes from audio stream.
   * @param doHandle Whether to enable DTMF analysis. The default values is **true**
   * @param supportedDtmfTypes The DTMF type to process. The default value is **ALL**
   */
  handleTones(doHandle: boolean, supportedDtmfTypes?: DTMFType): void;

  /**
   * Sends info (SIP INFO) message to the call.
   * @param mimeType MIME type of the message
   * @param body Message content. Maximum size is 8192 bytes according to the limits
   * @param headers Optional. Headers to be passed with the message. Custom header names have to begin with the 'X-' prefix. The "X-" headers could be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: **{'X-header':'value'}**
   */
  sendInfo(mimeType: string, body: string, headers?: { [header: string]: string }): void;

  /**
   * Sends DTMF digits to the remote peer.
   * @param digits Any combination of 0-9, *, #, p (pause) symbols
   */
  sendDigits(digits: string): void;

  /**
   * Whether to enable detection of microphone status in the call. If detection is enabled, the [CallEvents.MicStatusChange] event is triggered at each status' change.
   * @param handle Enable/disable microphone status analysis. The default value is **false**
   */
  handleMicStatus(handle: boolean): void;

  /**
   * Whether to enable blind transfers. When enabled, the [CallEvents.BlindTransferRequested] event is triggered to request for the third call leg within an existing session and notify the transfer initiator of the result.
   * @param handle Enable/disable blind transfers
   */
  handleBlindTransfer(handle: boolean): void;

  /**
   * Sends a notification of a successful call transfer with the **200 OK** message.
   */
  notifyBlindTransferSuccess(): void;

  /**
   * Sends a notification about a failed call transfer with an error code and reason.
   * @param code Error code
   * @param reason Reason why the blind transfer is failed
   */
  notifyBlindTransferFailed(code: number, reason: string): void;
}

/**
 * Represents a call list to interact with Voximplant's call list processing functionality.
 */
declare namespace CallList {}

declare namespace CallList {
  /**
   * Reports error to the CallList module asynchronously and continues the call list.
   * 
   * Call this method if the call attempt is not successful. If you do not call this method or 
   * [reportErrorAsync](/docs/references/voxengine/calllist/reporterrorasync), the call list considers this task 
   * successful and does not make any more attempts to call this task.
   * 
   * @param error Error string or JSON
   */
  function reportErrorAsync(error: string | Object): Promise<Net.HttpRequestResult>;
}

declare namespace CallList {
  /**
   * Reports error to the CallList module and continues the call list.
   * 
   * Call this method if the call attempt is not successful. If you do not call this method or 
   * [reportError](/docs/references/voxengine/calllist/reporterror), the call list considers this task 
   * successful and does not make any more attempts to call this task.
   * 
   * @param error Error string or JSON
   * @param callback Optional. Callback to execute when a result is processed
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
   */
  function reportProgressAsync(progress: string | Object): Promise<Net.HttpRequestResult>;
}

declare namespace CallList {
  /**
   * Report progress to the CallList module
   * @param progress Progress description string or JSON
   * @param callback Optional. Callback to execute when a result is processed
   */
  function reportProgress(
    progress: string | Object,
    callback?: (result: Net.HttpRequestResult) => void
  ): void;
}

declare namespace CallList {
  /**
   * Reports successful result to the CallList module asynchronously, saves the report to result_data field in the sheet, 
   * stops the calling attempts for this task and proceeds to the next task.
   * @param result Result description string or JSON
   */
  function reportResultAsync(result: string | Object): Promise<Net.HttpRequestResult>;
}

declare namespace CallList {
  /**
   * Reports successful result to the CallList module, saves the report to result_data field in the sheet, 
   * stops the calling attempts for this task and proceeds to the next task.
   * @param result Result description string or JSON
   * @param callback Optional. Callback to execute when a result is processed
   */
  function reportResult(
    result: string | Object,
    callback?: (result: Net.HttpRequestResult) => void
  ): void;
}

declare namespace CallList {
  /**
   * Changes parameters for the current task and request another calling attempt with updated data asynchronously.
   * 
   * This method can change the following fields for the current task: `start_at`, `attempts_left`, `custom_data`, 
   * `start_execution_time`, `end_execution_time` and `next_attempt_time`. The new values work for all remaining attempts.
   * This method does not change the global call list settings.
   * 
   * Note: if you do not change the `attempts_left` manually, the call list decreases its value by 1 automatically.
   * 
   * After an unsuccessful calling attempt, this method executes the 
   * [reportError](/docs/references/voxengine/calllist/reporterror) method automatically.
   * 
   * Refer to the [Editable call lists](/docs/guides/solutions/editable-call-lists) guide to learn more.
   * @param data Data to update
   */
  function requestNextAttemptAsync(data: Object): Promise<Net.HttpRequestResult>;
}

declare namespace CallList {
  /**
   * Changes parameters for the current task and request another calling attempt with updated data.
   * 
   * This method can change the following fields for the current task: `start_at`, `attempts_left`, `custom_data`, 
   * `start_execution_time`, `end_execution_time` and `next_attempt_time`. The new values work for all remaining attempts.
   * This method does not change the global call list settings.
   * 
   * Note: if you do not change the `attempts_left` manually, the call list decreases its value by 1 automatically.
   * 
   * After an unsuccessful calling attempt, this method executes the 
   * [reportError](/docs/references/voxengine/calllist/reporterror) method automatically.
   * 
   * Refer to the [Editable call lists](/docs/guides/solutions/editable-call-lists) guide to learn more.
   * @param data Data to update
   * @param callback Optional. Callback function to execute after the request is done
   */
  function requestNextAttempt(
    data: Object,
    callback?: (result: Net.HttpRequestResult) => void
  ): void;
}

declare module CCAI {
  /**
   * Represents a CCAI Agent instance.
   */
  class Agent {
    constructor(agentId: string, region?: string);

    /**
     * Returns the CCAI Agent id.
     */
    id(): string;

    /**
     * Destroys a CCAI Agent instance.
     */
    destroy(): void;

    /**
     * Gets the list of a Dialogflow conversation profiles.
     */
    getProfilesList(): Promise<GetProfilesListResult>;

    /**
     * Gets the Dialogflow conversation profile.
     * @param request Dialogflow get conversation profile [request data](https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#getconversationprofilerequest)
     */
    getConversationProfile(request: Object): Promise<GetConversationProfileResult>;

    /**
     * Updates the Dialogflow conversation profile.
     * @param request Dialogflow update conversation profile [request data](https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#updateconversationprofilerequest)
     */
    updateConversationProfile(request: Object): Promise<UpdateConversationProfileResult>;

    /**
     * Adds a handler for the specified [CCAI.Events.Agent] event. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called.
     * @param event Event class (i.e., [CCAI.Events.Agent.Started])
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    addEventListener<T extends keyof CCAI.Events._AgentEvents>(
      event: CCAI.Events.Agent | T,
      callback: (event: CCAI.Events._AgentEvents[T]) => any,
    ): void;

    /**
     * Removes a handler for the specified [CCAI.Events.Agent] event.
     * @param event Event class (i.e., [CCAI.Events.Agent.Started])
     * @param callback Optional. Handler function. If not specified, all handler functions are removed
     */
    removeEventListener<T extends keyof CCAI.Events._AgentEvents>(
      event: CCAI.Events.Agent | T,
      callback?: (event: CCAI.Events._AgentEvents[T]) => any,
    ): void;
  }
}

declare module CCAI {
}

declare module CCAI {
  /**
   * [Conversation] settings.
   */
  interface ConversationSettings {
    /**
     * CCAI agent to use in the Dialogflow conversation.
     */
    agent: CCAI.Agent;
    /**
     * Service to connect to the incoming Dialogflow conversation.
     */
    profile: CCAI.Vendor.ConversationProfile;
    /**
     * Name of the Dialogflow conversation.
     */
    project: string;
  }
}

declare module CCAI {
  /**
   * Represents a CCAI conversation instance.
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
     * Adds a handler for the specified [CCAI.Events.Conversation] event. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called.
     * @param event Event class (i.e., [CCAI.Events.Conversation.Created])
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    addEventListener<T extends keyof CCAI.Events._ConversationEvents>(
      event: CCAI.Events.Conversation | T,
      callback: (event: CCAI.Events._ConversationEvents[T]) => any,
    ): void;

    /**
     * Removes a handler for the specified [CCAI.Events.Conversation] event.
     * @param event Event class (i.e., [CCAI.Events.Conversation.Created])
     * @param callback Optional. Handler function. If not specified, all handler functions are removed
     */
    removeEventListener<T extends keyof CCAI.Events._ConversationEvents>(
      event: CCAI.Events.Conversation | T,
      callback?: (event: CCAI.Events._ConversationEvents[T]) => any,
    ): void;
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
       * Triggers after the [CCAI.Agent] instance is created.
       * @typedef _AgentStartedEvent
       */
      Started = 'AI.Events.CcaiAgentStarted',
      /**
       * Triggers after the [CCAI.Agent] instance is destroyed.
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
    interface _AgentEvent {
      /**
       * CCAI Agent istance that generated the event
       */
      ccaiAgent: CCAI.Agent;
    }

    /**
     * @private
     */
    interface _AgentStartedEvent extends _AgentEvent {
    }

    /**
     * @private
     */
    interface _AgentStoppedEvent extends _AgentEvent {
    }
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
       * Triggers after the [CCAI.Conversation] instance is created.
       * @typedef _ConversationCreatedEvent
       */
      Created = 'AI.Events.CcaiConversationCreated',
      /**
       * Triggered when a conversation profile is created in the specified project.
       * @typedef _ConversationProfileCreatedEvent
       */
      ProfileCreated = 'AI.Events.CcaiConversationProfileCreated',
      /**
       * Triggered when the conversation is completed.
       * @typedef _ConversationCompletedEvent
       */
      Completed = 'AI.Events.CcaiConversationCompleted',
      /**
       * Triggered when a [CCAI.Conversation] instance causes an error.
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
    interface _ConversationEvent {
      /**
       * CCAI Conversation istance that generated the event
       */
      ccaiConversation: CCAI.Conversation;
    }

    /**
     * @private
     */
    interface _ConversationCreatedEvent extends _ConversationEvent {
    }

    /**
     * @private
     */
    interface _ConversationProfileCreatedEvent extends _ConversationEvent {
    }

    /**
     * @private
     */
    interface _ConversationCompletedEvent extends _ConversationEvent {
    }

    /**
     * @private
     */
    interface _ConversationErrorEvent extends _ConversationEvent {
    }

    /**
     * @private
     */
    interface _ConversationErrorEvent extends _ConversationEvent {
    }
  }
}

declare module CCAI {
  module Events {
  }
}

declare module CCAI {
  module Events {
    /**
     * Events related to CCAI participants.
     * @event
     */
    enum Participant {
      /**
       * Triggers after the [CCAI.Participant] instance is created.
       * @typedef _ParticipantCreatedEvent
       */
      Created = 'AI.Events.CcaiParticipantCreated',
      /**
       * Triggered when a [CCAI.Participant] instance returns an intent response.
       * @typedef _ParticipantResponseEvent
       */
      Response = 'AI.Events.CcaiParticipantResponse',
      /**
       * Triggered when playback of a single phrase has finished successfully or in case of a playback error.
       * @typedef _ParticipantPlaybackFinishedEvent
       */
      PlaybackFinished = 'AI.Events.CcaiParticipantPlaybackFinished',
      /**
       * Triggered when playback of a single phrase has started.
       * @typedef _ParticipantPlaybackStartedEvent
       */
      PlaybackStarted = 'AI.Events.CcaiParticipantPlaybackStarted',
      /**
       * Triggered when playback of a single phrase has stoped.
       * @typedef _ParticipantPlaybackStoppedEvent
       */
      PlaybackStopped = 'AI.Events.CcaiParticipantPlaybackStopped',
      /**
       * Triggered when **audio_segments** from Google are ready to be played.
       * @typedef _ParticipantPlaybackReadyEvent
       */
      PlaybackReady = 'AI.Events.CcaiParticipantPlaybackReady',
      /**
       * Triggered when [CCAI.Participant.addPlaybackMarker] is reached.
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
      [Participant.PlaybackStopped]: _ParticipantPlaybackStoppedEvent;
    }

    /**
     * @private
     */
    interface _ParticipantEvent {
      /**
       * CCAI Participant istance that generated the event
       */
      ccaiParticipant: CCAI.Participant;
    }

    /**
     * @private
     */
    interface _ParticipantCreatedEvent extends _ParticipantEvent {
    }

    /**
     * @private
     */
    interface _ParticipantResponseEvent extends _ParticipantEvent {
    }

    /**
     * @private
     */
    interface _ParticipantPlaybackFinishedEvent extends _ParticipantEvent {
    }

    /**
     * @private
     */
    interface _ParticipantPlaybackStartedEvent extends _ParticipantEvent {
    }

    /**
     * @private
     */
    interface _ParticipantPlaybackStoppedEvent extends _ParticipantEvent {
    }

    /**
     * @private
     */
    interface _ParticipantPlaybackReadyEvent extends _ParticipantEvent {
    }

    /**
     * @private
     */
    interface _ParticipantMarkerReachedEvent extends _ParticipantEvent {
    }
  }
}

declare module CCAI {
  /**
   * [CCAI.Agent.getConversationProfile] method result.
   */
  interface GetConversationProfileResult {
    /**
     * Event ID.
     */
    id: string;
    /**
     * Event name — 'AI.Events.CcaiGetConversationProfileResponse'.
     */
    name: string;
    /**
     * Dialogflow [response data](https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#conversationprofile).
     */
    response: Object;
  }
}

declare module CCAI {
  /**
   * [CCAI.Agent.getProfilesList] method result.
   */
  interface GetProfilesListResult {
    /**
     * Event ID.
     */
    id: string;
    /**
     * Event name — 'AI.Events.CcaiListConversationProfilesResponse'.
     */
    name: string;
    /**
     * Dialogflow [response data](https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#listconversationsresponse).
     */
    response: Object;
  }
}

declare module CCAI {
  /**
   * [Participant] settings.
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
   * Represents a CCAI participant instance.
   */
  class Participant {
    /**
     * Returns the participant's id.
     */
    id(): string;

    /**
     * Returns the call associated with the participant.
     */
    call(): Call;

    /**
     * Adds a message from a participant into the Dialogflow CCAI.
     * @param query Message
     */
    analyzeContent(query: CCAI.Vendor.EventInput | CCAI.Vendor.TextInput): void;

    /**
     * Adds a Dialogflow speech synthesis playback marker. The [CCAI.Events.Participant.MarkerReached] event is triggered when the marker is reached.
     * @param offset Marker
     * @param playbackId Playback id
     */
    addPlaybackMarker(offset: number, playbackId?: string): void;

    /**
     * Adds a handler for the specified [CCAI.Events.Participant] event. Use only functions as handlers; anything except a function leads to an error and scenario termination when a handler is called.
     * @param event Event class (i.e., [CCAI.Events.Participant.Created])
     * @param callback Handler function. A single parameter is passed - object with event information
     */
    addEventListener<T extends keyof CCAI.Events._ParticipantEvents>(
      event: CCAI.Events.Participant | T,
      callback: (event: CCAI.Events._ParticipantEvents[T]) => any,
    ): void;

    /**
     * Removes a handler for the specified [CCAI.Events.Participant] event.
     * @param event Event class (i.e., [CCAI.Events.Participant.Created])
     * @param callback Optional. Handler function. If not specified, all handler functions are removed
     */
    removeEventListener<T extends keyof CCAI.Events._ParticipantEvents>(
      event: CCAI.Events.Participant | T,
      callback?: (event: CCAI.Events._ParticipantEvents[T]) => any,
    ): void;

    /**
     * Starts sending media (voice) from the Dialogflow participant to the media unit.
     * @param mediaUnit Media unit that receives media
     * @param parameters Optional. WebSocket interaction only parameters
     */
    sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

    /**
     * Stops sending voice from the Dialogflow participant to the media unit.
     * @param mediaUnit Media unit that stops receiving media
     */
    stopMediaTo(mediaUnit: VoxMediaUnit): void;
  }
}

declare module CCAI {
  /**
   * [CCAI.Agent.updateConversationProfile] method result.
   */
  interface UpdateConversationProfileResult {
    /**
     * Event ID.
     */
    id: string;
    /**
     * Event name — 'AI.Events.CcaiUpdateConversationProfileResponse'.
     */
    name: string;
    /**
     * Dialogflow [response data](https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#conversationprofile).
     */
    response: Object;
  }
}

declare module CCAI {
  module Vendor {
    /**
     * Defines the services to connect to the incoming Dialogflow conversations.
     */
    interface ConversationProfile {
      /**
       * The unique identifier of this conversation profile. Format: projects/<Project ID>/conversationProfiles/<Conversation Profile ID>.
       */
      name: string;
      /**
       * Optional. A human-readable name for this profile. Max length is **1024 bytes**.
       */
      display_name?: string;
    }
  }
}

declare module CCAI {
  module Vendor {
    /**
     * Events allow matching intents by event name instead of the natural language input. For instance, the <event: { name: "welcome_event", parameters: { name: "Sam" } }> input can trigger a personalized welcome response. The parameter `name` may be used by the agent in the response: `"Hello #welcome_event.name! What can I do for you today?"`.
     */
    interface EventInput {
      /**
       * The unique identifier of the event.
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
      parameters?: { [key: string]: any };
      /**
       * The language of this query. See [Language Support](https://cloud.google.com/dialogflow/docs/reference/language) for a list of the currently supported language codes. Note that queries in the same session do not necessarily need to have the same language.
       */
      language_code: string;
    }
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
       * Optional. Key-value filters on the metadata of documents returned by article suggestion. If specified, article suggestion only returns suggested documents that match all filters in their **Document.metadata**. Multiple values for a metadata key should be concatenated by a comma. For example, filters to match all documents that have 'US' or 'CA' in their market metadata values and 'agent' in their user metadata values are documents_metadata_filters { key: "market" value: "US,CA" } documents_metadata_filters { key: "user" value: "agent" }.
       */
      documents_metadata_filters?: { [key: string]: string };
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
     * Represents a natural language text to be processed.
     */
    interface TextInput {
      /**
       * The UTF-8 encoded natural language text to be processed. Text length must not exceed **256 characters**.
       */
      text: string;
      /**
       * The language of this conversational query. See [Language Support](https://cloud.google.com/dialogflow/docs/reference/language) for a list of the currently supported language codes. Note that queries in the same session do not necessarily need to have the same language.
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
  module Vendor {
  }
}

/**
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare enum ConferenceDirection {
  /**
   * Provides only outgoing stream from endpoint to conference.
   */
  SEND,
  /**
   * Provides only incoming stream from conference to endpoint.
   */
  RECEIVE,
  /**
   * Provides only outgoing stream from endpoint to conference.
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
   * Triggered when the conference has started. I.e., the call of [VoxEngine.createConference] triggers the event.
   * @typedef _ConferenceEvent
   */
  Started = 'Conference.Started',
  /**
   * Triggered when the conference is stopped. I.e., the call of [Conference.stop] triggers the event.
   * @typedef _ConferenceStoppedEvent
   */
  Stopped = 'Conference.Stopped',
  /**
   * Triggered when the endpoint is added.
   * @typedef _ConferenceEndpointEvent
   */
  EndpointAdded = 'Conference.EndpointAdded',
  /**
   * Triggered when the endpoint is updated.
   * @typedef _ConferenceEndpointEvent
   */
  EndpointUpdated = 'Conference.EndpointUpdated',
  /**
   * Triggered when the endpoint is removed.
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
   * Conference that triggered the event.
   */
  conference: Conference;
}

/**
 * @private
 */
declare interface _ConferenceEndpointEvent extends _ConferenceEvent {
  /**
   * **MIX** mode combines all streams in one, **FORWARD** mode sends only one stream.
   */
  mode: 'MIX' | 'FORWARD';
  /**
   * **SEND** provides only outgoing stream from endpoint to conference; **RECEIVE** provides only incoming stream from conference to endpoint; **BOTH** allows both incoming and outgoing streams.
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
declare interface _ConferenceEndpointAddedEvent extends _ConferenceEndpointEvent {
}

/**
 * @private
 */
declare interface _ConferenceEndpointUpdatedEvent extends _ConferenceEndpointEvent {
}

/**
 * @private
 */
declare interface _ConferenceEndpointRemovedEvent extends _ConferenceEndpointEvent {
}

/**
 * @private
 */
declare interface _ConferenceStoppedEvent extends _ConferenceEvent {
}

/**
 * @private
 */
declare interface _ConferenceErrorEvent extends _ConferenceEvent {
  /**
   * Error description.
   */
  error: string;
  /**
   * Error code.
   */
  code: number;
  /**
   * Optional. The id of the endpoint that caused the error.
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
   * Combine all streams simultaneously.
   */
  MIX,
  /**
   * Send only one stream.
   */
  FORWARD,
}

/**
 * [Conference] parameters. Can be passed as arguments to the [VoxEngine.createConference] method.
 */
declare interface ConferenceParameters {
  /**
   * Whether the audio is high definition. If set to **false** (default), audio stream has the frequency of 8kHz/32kbps. Otherwise, audio stream has the frequency of 48kHz/192kbps. Please note that default audio mode costs nothing while the high definition audio is billed additionally - for more details see the pricing page.
   */
  hd_audio: boolean;
}

/**
 * Represents a conference recorder.
 * <br>
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
   * Updates the current video recorder parameters.
   */
  update(parameters: UpdateRecorderVideoParameters): void;
}

/**
 * Represents audio or video conference.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare class Conference {
  /**
   * Adds a handler for the specified [ConferenceEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [ConferenceEvents.Started])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _ConferenceEvents>(
    event: ConferenceEvents | T,
    callback: (event: _ConferenceEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [ConferenceEvents] event.
   * @param event Event class (i.e., [ConferenceEvents.Started])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _ConferenceEvents>(
    event: ConferenceEvents | T,
    callback?: (event: _ConferenceEvents[T]) => any
  ): void;

  /**
   * Returns the conference's id.
   */
  id(): string;

  /**
   * Stops the conference. Triggers the [ConferenceEvents.Stopped] event.
   */
  stop(): void;

  /**
   * Gets the endpoint list for current conference.
   */
  getList(): Endpoint[];

  /**
   * Gets the endpoint by the id.
   * @param id Endpoint's id
   */
  get(id: string): Endpoint;

  /**
   * Creates a new [Endpoint] instance and adds it to the specified conference. ***IMPORTANT!*** You can only use this function for a conference with the “video conference” option checked in the routing rule.
   * Otherwise, you receive the [ConferenceEvents.ConferenceError] event with code **102**. The maximum number of endpoints is **100**.
   * @param parameters Endpoint parameters
   */
  add(parameters: EndpointParameters): Endpoint;

  /**
   * Starts sending media (voice and video) from the conference to the media unit.
   * @param mediaUnit Media unit that receives media
   * @param parameters Optional. WebSocket interaction only parameters
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

  /**
   * Stops sending media (voice and video) from the conference to the media unit.
   * @param mediaUnit Media unit that does not need to receive media from this conference anymore
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;
}

declare module Crypto {}

declare module Crypto {
  /**
   * Calculates HMAC-SHA256 hash of the specified data.
   * @param key Key for calculation purposes
   * @param data String to calculate hash of
   */
  function hmac_sha256(key: string, data: string): string;
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
 * See https://cloud.google.com/dialogflow/es/docs/reference/language#table
 * <br>
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.AI);
 * ```
 */
declare enum DialogflowLanguage {
  /**
   * Afrikaans.
   */
  AF = 'af',
  /**
   * Albanian.
   */
  SQ = 'sq',
  /**
   * Amharic.
   */
  AM = 'am',
  /**
   * Armenian.
   */
  HY = 'hy',
  /**
   * Azerbaijani.
   */
  AZ = 'az',
  /**
   * Basque.
   */
  EU = 'eu',
  /**
   * Belarusian.
   */
  BE = 'be',
  /**
   * Bangla.
   */
  BN = 'bn',
  /**
   * Bangla (Bangladesh).
   */
  BN_BD = 'bn-bd',
  /**
   * Bangla (India).
   */
  BN_IN = 'bn-in',
  /**
   * Bosnian.
   */
  BS = 'bs',
  /**
   * Bulgarian.
   */
  BG = 'bg',
  /**
   * Catalan.
   */
  CA = 'ca',
  /**
   * Cebuano.
   */
  CEB = 'ceb',
  /**
   * Nyanja.
   */
  NY = 'ny',
  /**
   * Chinese (Hong Kong SAR China).
   */
  ZH_HK = 'zh-hk',
  /**
   * Chinese (China).
   */
  ZH_CN = 'zh-cn',
  /**
   * Chinese (Taiwan).
   */
  ZH_TW = 'zh-tw',
  /**
   * Corsican.
   */
  CO = 'co',
  /**
   * Croatian.
   */
  HR = 'hr',
  /**
   * Czech.
   */
  CS = 'cs',
  /**
   * Danish.
   */
  DA = 'da',
  /**
   * Dutch.
   */
  NL = 'nl',
  /**
   * English.
   */
  EN = 'en',
  /**
   * Australian English.
   */
  EN_AU = 'en-au',
  /**
   * Canadian English.
   */
  EN_CA = 'en-ca',
  /**
   * British English.
   */
  EN_GB = 'en-gb',
  /**
   * English (India).
   */
  EN_IN = 'en-in',
  /**
   * American English.
   */
  EN_US = 'en-us',
  /**
   * Esperanto.
   */
  EO = 'eo',
  /**
   * Estonian.
   */
  ET = 'et',
  /**
   * Filipino.
   */
  FIL = 'fil',
  /**
   * Filipino (Philippines).
   */
  FIL_PH = 'fil-ph',
  /**
   * Finnish.
   */
  FI = 'fi',
  /**
   * French.
   */
  FR = 'fr',
  /**
   * Canadian French.
   */
  FR_CA = 'fr-ca',
  /**
   * French (France).
   */
  FR_FR = 'fr-fr',
  /**
   * Western Frisian.
   */
  FY = 'fy',
  /**
   * Galician.
   */
  GL = 'gl',
  /**
   * Georgian.
   */
  KA = 'ka',
  /**
   * German.
   */
  DE = 'de',
  /**
   * Greek.
   */
  EL = 'el',
  /**
   * Gujarati.
   */
  GU = 'gu',
  /**
   * Haitian Creole.
   */
  HT = 'ht',
  /**
   * Hausa.
   */
  HA = 'ha',
  /**
   * Hindi.
   */
  HI = 'hi',
  /**
   * Hmong.
   */
  HMN = 'hmn',
  /**
   * Hungarian.
   */
  HU = 'hu',
  /**
   * Icelandic.
   */
  IS = 'is',
  /**
   * Igbo.
   */
  IG = 'ig',
  /**
   * Indonesian.
   */
  ID = 'id',
  /**
   * Irish.
   */
  GA = 'ga',
  /**
   * Italian.
   */
  IT = 'it',
  /**
   * Japanese.
   */
  JA = 'ja',
  /**
   * Javanese.
   */
  JV = 'jv',
  /**
   * Kannada.
   */
  KN = 'kn',
  /**
   * Kazakh.
   */
  KK = 'kk',
  /**
   * Khmer.
   */
  KM = 'km',
  /**
   * Kinyarwanda.
   */
  RW = 'rw',
  /**
   * Korean.
   */
  KO = 'ko',
  /**
   * Kurdish.
   */
  KU = 'ku',
  /**
   * Kyrgyz.
   */
  KY = 'ky',
  /**
   * Latin.
   */
  LA = 'la',
  /**
   * Latvian.
   */
  LV = 'lv',
  /**
   * Lithuanian.
   */
  LT = 'lt',
  /**
   * Luxembourgish.
   */
  LB = 'lb',
  /**
   * Macedonian.
   */
  MK = 'mk',
  /**
   * Malagasy.
   */
  MG = 'mg',
  /**
   * Malay.
   */
  MS = 'ms',
  /**
   * Malay (Malaysia).
   */
  MS_MY = 'ms-my',
  /**
   * Malayalam.
   */
  ML = 'ml',
  /**
   * Maltese.
   */
  MT = 'mt',
  /**
   * Māori.
   */
  MI = 'mi',
  /**
   * Marathi.
   */
  MR = 'mr',
  /**
   * Marathi (India).
   */
  MR_IN = 'mr-in',
  /**
   * Mongolian.
   */
  MN = 'mn',
  /**
   * Nepali.
   */
  NE = 'ne',
  /**
   * Norwegian.
   */
  NO = 'no',
  /**
   * Odia.
   */
  OR = 'or',
  /**
   * Polish.
   */
  PL = 'pl',
  /**
   * Brazilian Portuguese.
   */
  PT_BR = 'pt-br',
  /**
   * Portuguese.
   */
  PT = 'pt',
  /**
   * Punjabi.
   */
  PA = 'pa',
  /**
   * Romanian.
   */
  RO = 'ro',
  /**
   * Romanian (Romania).
   */
  RO_RO = 'ro-ro',
  /**
   * Russian.
   */
  RU = 'ru',
  /**
   * Samoan.
   */
  SM = 'sm',
  /**
   * Scottish Gaelic.
   */
  GD = 'gd',
  /**
   * Serbian.
   */
  SR = 'sr',
  /**
   * Southern Sotho.
   */
  ST = 'st',
  /**
   * Shona.
   */
  SN = 'sn',
  /**
   * Sinhala.
   */
  SI = 'si',
  /**
   * Sinhala (Sri Lanka).
   */
  SI_LK = 'si-lk',
  /**
   * Slovak.
   */
  SK = 'sk',
  /**
   * Slovenian.
   */
  SL = 'sl',
  /**
   * Somali.
   */
  SO = 'so',
  /**
   * Spanish.
   */
  ES = 'es',
  /**
   * Latin American Spanish.
   */
  ES_419 = 'es-419',
  /**
   * European Spanish.
   */
  ES_ES = 'es-es',
  /**
   * Sundanese.
   */
  SU = 'su',
  /**
   * Swahili.
   */
  SW = 'sw',
  /**
   * Swedish.
   */
  SV = 'sv',
  /**
   * Tajik.
   */
  TG = 'tg',
  /**
   * Tamil.
   */
  TA = 'ta',
  /**
   * Tamil (India).
   */
  TA_IN = 'ta-in',
  /**
   * Tamil (Sri Lanka).
   */
  TA_LK = 'ta-lk',
  /**
   * Tamil (Malaysia).
   */
  TA_MY = 'ta-my',
  /**
   * Tamil (Singapore).
   */
  TA_SG = 'ta-sg',
  /**
   * Tatar.
   */
  TT = 'tt',
  /**
   * Telugu.
   */
  TE = 'te',
  /**
   * Telugu (India).
   */
  TE_IN = 'te-in',
  /**
   * Thai.
   */
  TH = 'th',
  /**
   * Turkish.
   */
  TR = 'tr',
  /**
   * Turkmen.
   */
  TK = 'tk',
  /**
   * Ukrainian.
   */
  UK = 'uk',
  /**
   * Uzbek.
   */
  UZ = 'uz',
  /**
   * Vietnamese.
   */
  VI = 'vi',
  /**
   * Vietnamese (Vietnam).
   */
  VI_VN = 'vi-vn',
  /**
   * Welsh.
   */
  CY = 'cy',
  /**
   * Xhosa.
   */
  XH = 'xh',
  /**
   * Yoruba.
   */
  YO = 'yo',
  /**
   * Zulu.
   */
  ZU = 'zu',
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

/**
 * The DTMF type.
 */
declare enum DTMFType {
  /**
   * All types of DTMF tones trigger the [CallEvents.ToneReceived] event: in-band , RFC 2833 and SIP INFO. Receiving an RFC 2833 tone disables processing of in-band tones to avoid duplicating
   */
  ALL = 0,
  /**
   * Only RFC 2833 DTMF tones trigger the [CallEvents.ToneReceived] event
   */
  TELEPHONE_EVENT = 1,
  /**
   * Only in-band DTMF tones trigger the [CallEvents.ToneReceived] event
   */
  IN_BAND = 2,
  /**
   * Only SIP INFO DTMF tones trigger the [CallEvents.ToneReceived] event
   */
  SIP_INFO = 3,
}

/**
 * [Endpoint] parameters. Can be passed as arguments to the [Conference.add] method.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Conference);
 * ```
 */
declare interface EndpointParameters {
  /**
   * [Call] to be connected to the conference.
   */
  call: Call;
  /**
   * **MIX** mode combines all streams into one, **FORWARD** mode sends only one stream.
   */
  mode: 'MIX' | 'FORWARD';
  /**
   * **SEND** provides only outgoing stream from endpoint to conference, **RECEIVE** provides only incoming stream from conference to endpoint, **BOTH** allows both incoming and outgoing streams.
   */
  direction: 'SEND' | 'RECEIVE' | 'BOTH';
  /**
   * Internal information about codecs.
   */
  scheme: any;
  /**
   * Human-readable endpoint's name.
   */
  displayName: string;
  /**
   * Optional. Endpoints and their streams (audio and/or video) to receive. These settings apply to the target endpoint right after adding it to a conference.
   * @beta
   */
  receiveParameters?: ReceiveParameters;
  /**
   * Maximum endpoint's video bitrate in kbps.
   */
  maxVideoBitrate: number;
}

/**
 * Represents any remote media unit in a session. An endpoint can be represented as [ASR], [Recorder], [Player] or another [Call].
 * <br>
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
   * Returns the endpoint's direction. **SEND** provides only outgoing stream from endpoint to conference, **RECEIVE** provides only incoming stream from conference to endpoint, **BOTH** allows both incoming and outgoing streams.
   */
  getDirection(): 'SEND' | 'RECEIVE' | 'BOTH';

  /**
   * Returns the endpoint's mode. **MIX** mode combines all streams in one, **FORWARD** mode sends only one stream.
   */
  getMode(): 'MIX' | 'FORWARD';

  /**
   * Sets the display name for the specified endpoint. When the display name is set, all SDK clients receive 'EndpointEvents.InfoUpdated' event.
   * @param displayName
   */
  setDisplayName(displayName: string): void;

  /**
   * Enables/disables receiving media streams from other conference participants.
   * @param parameters Media stream receive parameters
   * @beta
   */
  manageEndpoint(parameters: ReceiveParameters): Promise<void>;

  /**
   * Returns the endpoint's [Call] object if the endpoint is not a player or recorder instance.
   */
  getCall(): Call;
}

/**
 * Global IVR control module.
 * <br>
 * Add the following line to your scenario code to use the namespace:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare module IVR {}

declare module IVR {
  /**
   * Resets the IVR; i.e., the method clears the list of existed [IVRState] objects. Use it to stop the entire IVR logic (e.g. near the call's ending).
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.IVR);
   * ```
   */
  function reset(): void;
}

/**
 * IVR menu prompt settings. Can be passed via the [IVRSettings.prompt] parameter. Note that it is possible to specify playing parameter or a pair of the say and lang parameters.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare interface IVRPrompt {
  /**
   * Voice message to say. Use it together with the lang parameter. SSML is supported; to use it, specify [TTSOptions] before creating an IVRState instance:<br><code>IVR.ttsOptions = { "pitch": "low", "rate": "slow", "volume": "loud" }</code>
   */
  say: string;
  /**
   * TTS language for pronouncing a value of the <b>say</b> parameter. List of all supported voices: [VoiceList].
   */
  lang: string;
  /**
   * Voice message url to play. Supported formats are <b>mp3</b> and <b>ogg</b>.
   */
  play: string;
}

/**
 * IVR menu state settings. Can be passed via the [IVRState.settings] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.IVR);
 * ```
 */
declare interface IVRSettings {
  /**
   * Prompt settings object.
   */
  prompt: IVRPrompt;
  /**
   * Menu type. Possible values: **select**, **inputfixed**, **inputunknown**, **noinput**.
   */
  type: string;
  /**
   * For **inputunknown** states - whether input is complete (input is passed as string).
   */
  inputValidator: (input: string) => boolean;
  /**
   * For **inputfixed** - length of desired input.
   */
  inputLength: number;
  /**
   * Timeout in milliseconds for user input. The default value is **5000**.
   */
  timeout: number;
  /**
   * For **select** type, map of IVR states to go to according to user input. If there is no next state for specific input, **onInputComplete** is invoked.
   */
  nextStates: { [name: string]: IVRState };
  /**
   * When this digit is entered in **inputunknown** mode, input is considered to be complete.
   */
  terminateOn: string;
  /**
   * Next state to go - for **noinput** state type.
   */
  nextState: IVRState | null;
}

/**
 * Represents an IVR menu state.
 * <br>
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

declare namespace Logger {
  /**
   * Whether to disable DTMF logging.
   * @param flag The default value is **false**
   */
  function hideTones(flag: boolean): void;
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
  /**
   * Provides the [ACD v1](/docs/guides/smartqueue/acdv1) functionality.
   * <br>
   * We recommend using [SmartQueue] instead of ACD v1.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.ACD);
   * ```
   */
  ACD = 'acd',
  /**
   * Provides additional methods that use Artificial Intelligence. These methods allow solving business tasks in more productive way.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.AI);
   * ```
   */
  AI = 'ai',
  /**
   * Provides the [key-value storage](/docs/guides/voxengine/kvs) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.ApplicationStorage);
   * ```
   */
  ApplicationStorage = 'applicationstorage',
  /**
   * Provides the [speech recognition](/docs/guides/speech/stt) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.ASR);
   * ```
   */
  ASR = 'asr',
  /**
   * Provides the [Voximplant Avatar](/docs/guides/ai/avatar) (virtual assistant based on AI and NLP) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.Avatar);
   * ```
   */
  Avatar = 'avatar',
  /**
   * Provides the [audio and video conferencing](/docs/guides/conferences) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.Conference);
   * ```
   */
  Conference = 'conference',
  /**
   * Provides the [interactive voice menus](/docs/guides/speech/ivr) functionality.
   * <br>
   * Instead, you can implement this functionality via the [Call.say], [Call.startPlayback] and [Call.handleTones] methods, but this module gives more straightforward approach.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.IVR);
   * ```
   */
  IVR = 'ivr',
  /**
   * Provides the OpenAI functionality.
   */
  OpenAI = 'openai',
  /**
   * Provides the push notification functionality for [iOS](/docs/guides/sdk/iospush) and [Android](/docs/guides/sdk/androidpush) devices.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.PushService);
   * ```
   */
  PushService = 'pushservice',
  /**
   * Provides the [call recording](/docs/guides/calls/record) and [conference recording](/docs/guides/conferences/record) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.Recorder);
   * ```
   */
  Recorder = 'recorder',
  /**
   * Provides the SmartQueue (ACD v2) functionality for implementing a [contact center](/docs/guides/smartqueue).
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.SmartQueue);
   * ```
   */
  SmartQueue = 'smartqueue',
  /**
   * Provides the [streaming](/docs/guides/calls/stream) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.StreamingAgent);
   * ```
   */
  StreamingAgent = 'streamingagent',
  /**
   * Provides the [Voximplant HTTP API](https://voximplant.com/docs/references/httpapi) functionality.
   * <br>
   * Add the following line to your scenario code to use the module:
   * ```
   * require(Modules.VoximplantAPI);
   * ```
   */
  VoximplantAPI = 'voximplantapi',
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
   * Performs a regular HTTP or HTTPS request. To perform an HTTPS request, insert "https://" at the URL's beginning. The default request method is **GET**, TCP connect timeout is **6** seconds and total request timeout is **90** seconds. Learn more about the [limits](/docs/guides/voxengine/limits).
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
    html?: string;
    /**
     * CC addresses
     */
    cc?: string[];
    /**
     * BCC addresses
     */
    bcc?: string[];
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
   * @param callback Function to be called on completion. The function receives a response object of type [SendMailResult] as a first argument
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

declare namespace OpenAI {
  /**
   * The Realtime API (Beta) enables you to build low-latency, multi-modal conversational experiences.
   */
  namespace Beta {
  }
}
declare namespace OpenAI {
  namespace Beta {
    /**
     * Creates an [OpenAI.Beta.RealtimeAPIClient] instance.
     * @param parameters The [OpenAI.Beta.RealtimeAPIClient] parameters
     */
    function createRealtimeAPIClient(parameters: RealtimeAPIClientParameters): Promise<RealtimeAPIClient>
  }
}
declare namespace OpenAI {
  namespace Beta {
    /**
     * @event
     */
    enum Events {
      /**
       * Triggered when the audio stream sent by a third party through an OpenAI WebSocket is started playing.
       * @typedef _WebSocketMediaStartedEvent
       */
      WebSocketMediaStarted = 'OpenAI.Beta.Events.WebSocketMediaStarted',
      /**
       * Triggers after the end of the audio stream sent by a third party through an OpenAI WebSocket (**1 second of silence**).
       * @typedef _WebSocketMediaEndedEvent
       */
      WebSocketMediaEnded = 'OpenAI.Beta.Events.WebSocketMediaEnded',
    }

    /**
     * @private
     */
    interface _Events {
      [Events.WebSocketMediaStarted]: _WebSocketMediaStartedEvent;
      [Events.WebSocketMediaEnded]: _WebSocketMediaEndedEvent;
    }

    /**
     * @private
     */
    interface _Event {
      /**
       * The [OpenAI.Beta.RealtimeAPIClient] instance.
       */
      client: RealtimeAPIClient;
    }

    /**
     * @private
     */
    interface _WebSocketMediaEvent extends _Event {
      /**
       * Special tag to name audio streams sent over one OpenAI WebSocket connection. With it, one can send 2 audios to 2 different media units at the same time.
       */
      tag?: string;
    }

    /**
     * @private
     */
    interface _WebSocketMediaStartedEvent extends _WebSocketMediaEvent {
      /**
       * Audio encoding formats.
       */
      encoding?: string;
      /**
       * Custom parameters.
       */
      customParameters?: { [key: string]: string };
    }

    /**
     * @private
     */
    interface _WebSocketMediaEndedEvent extends _WebSocketMediaEvent {
      /**
       * Information about the audio stream that can be obtained after the stream stops or pauses (**1 second of silence**).
       */
      mediaInfo?: WebSocketMediaInfo;
    }
  }
}


declare namespace OpenAI {
  namespace Beta {
    /**
     * @private
     */
    interface _RealtimeAPIClientEvents extends _Events, _RealtimeAPIEvents {
    }
  }
}
declare namespace OpenAI {
  namespace Beta {
    /**
     * [OpenAI.Beta.RealtimeAPIClient] parameters. Can be passed as arguments to the [OpenAI.Beta.createRealtimeAPIClient] method.
     */
    interface RealtimeAPIClientParameters {
      /**
       * The API key for the OpenAI Realtime API.
       */
      apiKey: string;
      /**
       * Optional. The model to use for OpenAI Realtime API processing. The default value is **gpt-4o-realtime-preview-2024-10-01**.
       */
      model?: string;
      /**
       * Optional. A callback function that is called when the [WebSocket] connection is closed.
       */
      onWebSocketClose?: (event: _WebSocketCloseEvent) => void;
    }
  }
}

declare namespace OpenAI {
  namespace Beta {
    class RealtimeAPIClient {
      /**
       * Returns the RealtimeAPIClient id.
       */
      id(): string;

      /**
       * Returns the RealtimeAPIClient WebSocket id.
       */
      webSocketId(): string;

      /**
       * Closes the RealtimeAPIClient connection (over WebSocket) or connection attempt.
       */
      close(): void;

      /**
       * Starts sending media from the RealtimeAPIClient (via WebSocket) to the media unit. RealtimeAPIClient works in real time.
       * @param mediaUnit Media unit that receives media
       * @param parameters Optional interaction parameters
       */
      sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

      /**
       * Stops sending media from the RealtimeAPIClient (via WebSocket) to the media unit.
       * @param mediaUnit Media unit that stops receiving media
       */
      stopMediaTo(mediaUnit: VoxMediaUnit): void;

      /**
       * Adds a handler for the specified [OpenAI.Beta.RealtimeAPIEvents] or [OpenAI.Beta.Events] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
       * @param event Event class (i.e., [OpenAI.Beta.RealtimeAPIEvents.Error])
       * @param callback Handler function. A single parameter is passed - object with event information
       */
      addEventListener<T extends keyof OpenAI.Beta._RealtimeAPIClientEvents>(
        event: OpenAI.Beta.Events | OpenAI.Beta.RealtimeAPIEvents | T,
        callback: (event: OpenAI.Beta._RealtimeAPIClientEvents[T]) => any,
      ): void;

      /**
       * Removes a handler for the specified [OpenAI.Beta.RealtimeAPIEvents] or [OpenAI.Beta.Events] event.
       * @param event Event class (i.e., [OpenAI.Beta.RealtimeAPIEvents.Error])
       * @param callback Optional. Handler function. If not specified, all handler functions are removed
       */
      removeEventListener<T extends keyof OpenAI.Beta._RealtimeAPIClientEvents>(
        event: OpenAI.Beta.Events | OpenAI.Beta.RealtimeAPIEvents | T,
        callback?: (event: OpenAI.Beta._RealtimeAPIClientEvents[T]) => any,
      ): void;

      /**
       * Add a new Item to the Conversation's context, including messages, function calls, and function call responses. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create).
       * @param previousItemId The ID of the preceding item after which the new item will be inserted. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create#realtime-client-events/conversation/item/create-previous_item_id](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create#realtime-client-events/conversation/item/create-previous_item_id)
       * @param item The item to add to the conversation. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create#realtime-client-events/conversation/item/create-item](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create#realtime-client-events/conversation/item/create-item)
       * @param eventId Optional. Client-generated ID used to identify this event. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create#realtime-client-events/conversation/item/create-event_id](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create#realtime-client-events/conversation/item/create-event_id)
       */
      conversationItemCreate(previousItemId: string, item: Object, eventId?: string): void

      /**
       * Send this event to truncate a previous assistant message’s audio. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate).
       * @param itemId The ID of the assistant message item to truncate. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-item_id](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-item_id)
       * @param contentIndex The index of the content part to truncate. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-content_index](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-content_index)
       * @param audioEndMs Inclusive duration up to which audio is truncated, in milliseconds. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-audio_end_ms](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-audio_end_ms)
       * @param eventId Optional. Client-generated ID used to identify this event. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-event_id](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate#realtime-client-events/conversation/item/truncate-event_id)
       */
      conversationItemTruncate(itemId: string, contentIndex: number, audioEndMs: number, eventId?: string): void


      /**
       * Send this event when you want to remove any item from the conversation history. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/delete](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/delete).
       * @param itemId The ID of the item to delete. (https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/delete#realtime-client-events/conversation/item/delete-item_id)
       * @param eventId Optional. Client-generated ID used to identify this event. [https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/delete#realtime-client-events/conversation/item/delete-event_id](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/delete#realtime-client-events/conversation/item/delete-event_id)
       */
      conversationItemDelete(itemId: string, eventId?: string): void

      /**
       * Updates the session’s default configuration. [https://platform.openai.com/docs/api-reference/realtime-client-events/session/update](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update).
       * @param session Realtime session object configuration.[https://platform.openai.com/docs/api-reference/realtime-client-events/session/update#realtime-client-events/session/update-session](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update#realtime-client-events/session/update-session). NOTE: the 'input_audio_format' parameter will be ignored
       * @param eventId Optional. Client-generated ID used to identify this event. [https://platform.openai.com/docs/api-reference/realtime-client-events/session/update#realtime-client-events/session/update-event_id](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update#realtime-client-events/session/update-event_id)
       */
      sessionUpdate(session: Object, eventId?: string): void

      /**
       * Instructs the server to create a Response, which means triggering model inference. [https://platform.openai.com/docs/api-reference/realtime-client-events/response/create](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create).
       * @param response The response resource. [https://platform.openai.com/docs/api-reference/realtime-client-events/response/create#realtime-client-events/response/create-response](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create#realtime-client-events/response/create-response). NOTE: the 'input_audio_format' parameter will be ignored
       * @param eventId Optional. Client-generated ID used to identify this event. [https://platform.openai.com/docs/api-reference/realtime-client-events/response/create#realtime-client-events/response/create-event_id](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create#realtime-client-events/response/create-event_id)
       */
      responseCreate(response: Object, eventId?: string): void

      /**
       * Cancels an in-progress response. [https://platform.openai.com/docs/api-reference/realtime-client-events/response/cancel](https://platform.openai.com/docs/api-reference/realtime-client-events/response/cancel).
       * @param eventId Optional. Client-generated ID used to identify this event. [https://platform.openai.com/docs/api-reference/realtime-client-events/response/cancel#realtime-client-events/response/cancel-event_id](https://platform.openai.com/docs/api-reference/realtime-client-events/response/cancel#realtime-client-events/response/cancel-event_id)
       */
      responseCancel(eventId?: string): void
    }
  }
}
declare namespace OpenAI {
  namespace Beta {
    /**
     * @event
     */
    enum RealtimeAPIEvents {
      /**
       * The unknown event.
       * @typedef _RealtimeAPIEvent
       */
      Unknown = 'OpenAI.Beta.RealtimeAPI.Unknown',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/error](https://platform.openai.com/docs/api-reference/realtime-server-events/error)
       * @typedef _RealtimeAPIEvent
       */
      Error = 'OpenAI.Beta.RealtimeAPI.Error',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/session/created](https://platform.openai.com/docs/api-reference/realtime-server-events/session/created)
       * @typedef _RealtimeAPIEvent
       */
      SessionCreated = 'OpenAI.Beta.RealtimeAPI.SessionCreated',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/session/updated](https://platform.openai.com/docs/api-reference/realtime-server-events/session/updated)
       * @typedef _RealtimeAPIEvent
       */
      SessionUpdated = 'OpenAI.Beta.RealtimeAPI.SessionUpdated',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/created](https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/created)
       * @typedef _RealtimeAPIEvent
       */
      ConversationCreated = 'OpenAI.Beta.RealtimeAPI.ConversationCreated',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/created](https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/created)
       * @typedef _RealtimeAPIEvent
       */
      ConversationItemCreated = 'OpenAI.Beta.RealtimeAPI.ConversationItemCreated',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/input_audio_transcription/completed](https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/input_audio_transcription/completed)
       * @typedef _RealtimeAPIEvent
       */
      ConversationItemInputAudioTranscriptionCompleted = 'OpenAI.Beta.RealtimeAPI.conversationItemInputAudioTranscriptionCompleted',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/input_audio_transcription/failed](https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/input_audio_transcription/failed)
       * @typedef _RealtimeAPIEvent
       */
      ConversationItemInputAudioTranscriptionFailed = 'OpenAI.Beta.RealtimeAPI.conversationItemInputAudioTranscriptionFailed',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/truncated](https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/truncated)
       * @typedef _RealtimeAPIEvent
       */
      ConversationItemTruncated = 'OpenAI.Beta.RealtimeAPI.ConversationItemTruncated',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/deleted](https://platform.openai.com/docs/api-reference/realtime-server-events/conversation/item/deleted)
       * @typedef _RealtimeAPIEvent
       */
      ConversationItemDeleted = 'OpenAI.Beta.RealtimeAPI.ConversationItemDeleted',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/committed](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/committed)
       * @typedef _RealtimeAPIEvent
       */
      InputAudioBufferCommitted = 'OpenAI.Beta.RealtimeAPI.InputAudioBufferCommitted',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/cleared](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/cleared)
       * @typedef _RealtimeAPIEvent
       */
      InputAudioBufferCleared = 'OpenAI.Beta.RealtimeAPI.InputAudioBufferCleared',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started)
       * @typedef _RealtimeAPIEvent
       */
      InputAudioBufferSpeechStarted = 'OpenAI.Beta.RealtimeAPI.InputAudioBufferSpeechStarted',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/speech_stopped](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/speech_stopped)
       * @typedef _RealtimeAPIEvent
       */
      InputAudioBufferSpeechStopped = 'OpenAI.Beta.RealtimeAPI.InputAudioBufferSpeechStopped',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/created](https://platform.openai.com/docs/api-reference/realtime-server-events/response/created)
       * @typedef _RealtimeAPIEvent
       */
      ResponseCreated = 'OpenAI.Beta.RealtimeAPI.ResponseCreated',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseDone = 'OpenAI.Beta.RealtimeAPI.ResponseDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_item/added](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_item/added)
       * @typedef _RealtimeAPIEvent
       */
      ResponseOutputItemAdded = 'OpenAI.Beta.RealtimeAPI.ResponseOutputItemAdded',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_item/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_item/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseOutputItemDone = 'OpenAI.Beta.RealtimeAPI.ResponseOutputItemDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/content_part/added](https://platform.openai.com/docs/api-reference/realtime-server-events/response/content_part/added)
       * @typedef _RealtimeAPIEvent
       */
      ResponseContentPartAdded = 'OpenAI.Beta.RealtimeAPI.ResponseContentPartAdded',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/content_part/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/content_part/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseContentPartDone = 'OpenAI.Beta.RealtimeAPI.ResponseContentPartDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/text/delta](https://platform.openai.com/docs/api-reference/realtime-server-events/response/text/delta)
       * @typedef _RealtimeAPIEvent
       */
      ResponseTextDelta = 'OpenAI.Beta.RealtimeAPI.ResponseTextDelta',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/text/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/text/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseTextDone = 'OpenAI.Beta.RealtimeAPI.ResponseTextDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio_transcript/delta](https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio_transcript/delta)
       * @typedef _RealtimeAPIEvent
       */
      ResponseAudioTranscriptDelta = 'OpenAI.Beta.RealtimeAPI.ResponseAudioTranscriptDelta',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio_transcript/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio_transcript/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseAudioTranscriptDone = 'OpenAI.Beta.RealtimeAPI.ResponseAudioTranscriptDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio/delta](https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio/delta)
       * @typedef _RealtimeAPIEvent
       */
      ResponseAudioDelta = 'OpenAI.Beta.RealtimeAPI.ResponseAudioDelta',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/audio/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseAudioDone = 'OpenAI.Beta.RealtimeAPI.ResponseAudioDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/function_call_arguments/delta](https://platform.openai.com/docs/api-reference/realtime-server-events/response/function_call_arguments/delta)
       * @typedef _RealtimeAPIEvent
       */
      ResponseFunctionCallArgumentsDelta = 'OpenAI.Beta.RealtimeAPI.ResponseFunctionCallArgumentsDelta',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/response/function_call_arguments/done](https://platform.openai.com/docs/api-reference/realtime-server-events/response/function_call_arguments/done)
       * @typedef _RealtimeAPIEvent
       */
      ResponseFunctionCallArgumentsDone = 'OpenAI.Beta.RealtimeAPI.ResponseFunctionCallArgumentsDone',
      /**
       * [https://platform.openai.com/docs/api-reference/realtime-server-events/rate_limits/updated](https://platform.openai.com/docs/api-reference/realtime-server-events/rate_limits/updated)
       * @typedef _RealtimeAPIEvent
       */
      RateLimitsUpdated = 'OpenAI.Beta.RealtimeAPI.RateLimitsUpdated',
    }

    /**
     * @private
     */
    interface _RealtimeAPIEvents {
      [RealtimeAPIEvents.Unknown]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.Error]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.SessionCreated]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.SessionUpdated]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ConversationCreated]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ConversationItemCreated]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ConversationItemInputAudioTranscriptionCompleted]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ConversationItemInputAudioTranscriptionFailed]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ConversationItemTruncated]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ConversationItemDeleted]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.InputAudioBufferCommitted]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.InputAudioBufferCleared]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.InputAudioBufferSpeechStarted]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.InputAudioBufferSpeechStopped]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseCreated]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseOutputItemAdded]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseOutputItemDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseContentPartAdded]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseContentPartDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseTextDelta]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseTextDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseAudioTranscriptDelta]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseAudioTranscriptDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseAudioDelta]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseAudioDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseFunctionCallArgumentsDelta]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.ResponseFunctionCallArgumentsDone]: _RealtimeAPIEvent;
      [RealtimeAPIEvents.RateLimitsUpdated]: _RealtimeAPIEvent;
    }

    /**
     * @private
     */
    interface _RealtimeAPIEvent {
      /**
       * The [OpenAI.Beta.RealtimeAPIClient] instance.
       */
      client: RealtimeAPIClient;
      /**
       * The event's data.
       */
      data?: Object;
    }
  }
}


declare namespace OpenAI {
}
/**
 * Which media streams to receive from the endpoint. Can be passed as a [ReceiveParameters] parameter. Consists of optional video and audio keys.
 * <br>
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
     * Whether the number is possible in specified country (just by analyzing length information)
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
     * Optional. Error string. Possible values are: INVALID\_COUNTRY\_CODE, NOT\_A\_NUMBER, TOO\_SHORT\_AFTER\_IDD, TOO\_SHORT\_NSN, TOO\_LONG\_NSN
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
   * Triggered when [Player] created.
   * @typedef _PlayerCreatedEvent
   */
  Created = 'Player.Created',

  /**
   * Triggers by the [createURLPlayer] and [createTTSPlayer] methods when<br>
   * 1) the audio file download to the Voximplant cache is finished;<br>
   * 2) the audio file is found in the cache (i.e., it is in the cache before).
   * @typedef _PlayerPlaybackReadyEvent
   */
  PlaybackReady = 'Player.PlaybackReady',

  /**
   * Triggered when playback is started. Note that if the [createURLPlayer] method is called with the **onPause** parameter set to true, the event is not triggered; it is triggered after the [Player.resume] method call.
   * @typedef _PlayerStartedEvent
   */
  Started = 'Player.Started',

  /**
   * Triggers as a result of the [Player.stop] method call.
   * @typedef _PlayerStoppedEvent
   */
  Stopped = 'Player.Stopped',

  /**
   * Triggered when playback has finished successfully or with an error
   * @typedef _PlayerPlaybackFinishedEvent
   */
  PlaybackFinished = 'Player.PlaybackFinished',

  /**
   * Triggered when playback has finished with an error
   * @typedef _PlayerErrorEvent
   */
  Error = 'Player.Error',

  /**
   * Triggered when [Player.addMarker] is reached
   * @typedef _PlayerPlaybackMarkerReachedEvent
   */
  PlaybackMarkerReached = 'Player.PlaybackMarkerReached',

  /**
   * Triggered when an audio file is playing faster than it is being loaded.
   * @typedef _PlayerPlaybackBufferingEvent
   */
  PlaybackBuffering = 'Player.Buffering',
}

/**
 * @private
 */
declare interface _PlayerEvents {
  [PlayerEvents.Created]: _PlayerCreatedEvent;
  [PlayerEvents.PlaybackReady]: _PlayerPlaybackReadyEvent;
  [PlayerEvents.Started]: _PlayerStartedEvent;
  [PlayerEvents.Stopped]: _PlayerStoppedEvent;
  [PlayerEvents.PlaybackFinished]: _PlayerPlaybackFinishedEvent;
  [PlayerEvents.Error]: _PlayerErrorEvent;
  [PlayerEvents.PlaybackMarkerReached]: _PlayerPlaybackMarkerReachedEvent;
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
declare interface _PlayerCreatedEvent extends _PlayerEvent {}

/**
 * @private
 */
declare interface _PlayerPlaybackReadyEvent extends _PlayerEvent {}

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
declare interface _PlayerStoppedEvent extends _PlayerEvent {}

/**
 * @private
 */
declare interface _PlayerPlaybackFinishedEvent extends _PlayerEvent {
  /**
   * Optional. Error message
   */
  error?: string;
}

/**
 * @private
 */
declare interface _PlayerErrorEvent extends _PlayerEvent {
  /**
   * Error message
   */
  error: string;
}

/**
 * @private
 */
declare interface _PlayerPlaybackMarkerReachedEvent extends _PlayerEvent {
  /**
   * The marker offset
   */
  offset: number;
}

/**
 * @private
 */
declare interface _PlayerPlaybackBufferingEvent extends _PlayerEvent {}

/**
 * Represents an audio player.
 */
declare class Player {
  /**
   * Adds a handler for the specified [PlayerEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [PlayerEvents.PlaybackFinished])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _PlayerEvents>(
    event: PlayerEvents | T,
    callback: (event: _PlayerEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [PlayerEvents] event.
   * @param event Event class (i.e., [PlayerEvents.PlaybackFinished])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _PlayerEvents>(
    event: PlayerEvents | T,
    callback?: (event: _PlayerEvents[T]) => any
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
   * Adds a playback marker. The [PlayerEvents.PlaybackMarkerReached] event is triggered when the marker is reached.
   * @param offset Positive/negative offset in milliseconds from the start/end of media
   */
  addMarker(offset: number): void;

  /**
   * Starts sending media from the player to the media unit.
   * @param mediaUnit Media unit that receives media
   * @param parameters Optional. WebSocket interaction only parameters
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

  /**
   * Stops sending media from the player to the media unit.
   * @param mediaUnit Media unit that does not need to receive media from this conference anymore
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;
}

/**
 * An object that specifies what media streams to receive from each [Endpoint]. Can be passed via the [EndpointParameters.receiveParameters] parameter or an argument to the [Endpoint.manageEndpoint] method.
 * <br>
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
 * List of available values for the [RecorderParameters.expire] parameter.
 */
declare enum RecordExpireTime {
  THREEMONTHS = '',
  SIXMONTHS = '-6m',
  ONEYEAR = '-1y',
  TWOYEARS = '-2y',
  THREEYEARS = '-3y',
  FIVEYEARS = '-5y',
}

/**
 * An object that specifies video frame's direction. Can be passed via the [RecorderVideoParameters.layoutSettings] and [UpdateRecorderVideoParameters.layoutSettings] parameter.
 * <br>
 * Add the following line to your scenario code to use the type:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare type RecorderDirection = 'ltr' | 'rtl';

/**
 * An object that specifies video frame parameters. Can be passed via the [RecorderVideoParameters.layoutSettings] and [UpdateRecorderVideoParameters.layoutSettings] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 *  */
declare interface RecorderDrawArea {
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
   * The corresponding grid parameters object.
   */
  grid: RecorderGridDefinition[];
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
   * Triggers in case of errors during the recording process.
   * @typedef _RecorderErrorEvent
   */
  RecorderError = 'Recorder.Error',
  /**
   * Triggers after the recording's start.
   * @typedef _RecorderURLEvent
   */
  Started = 'Recorder.Started',
  /**
   * Triggers after the recording's stop.
   * @typedef _RecorderStoppedEvent
   */
  Stopped = 'Recorder.Stopped',
}

/**
 * @private
 */
declare interface _RecorderEvent {
  /**
   * Recorder that generated the event.
   */
  recorder: Recorder;
}

/**
 * @private
 */
declare interface _RecorderURLEvent extends _RecorderEvent {
  /**
   * The link to the record.
   */
  url: string;
}

/**
 * @private
 */
declare interface _RecorderErrorEvent extends _RecorderEvent {
  /**
   * Error message.
   */
  error: string;
}

/**
 * @private
 */
declare interface _RecorderStartedEvent extends _RecorderURLEvent {
}

/**
 * @private
 */
declare interface _RecorderStoppedEvent extends _RecorderEvent {
  /**
   * Record cost (in the account's currency: USD, EUR or RUB).
   */
  cost: string;
  /**
   * Record duration in seconds.
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
 * An object that specifies grid parameters. Can be passed via the [RecorderDrawArea.grid] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare interface RecorderGridDefinition {
  /**
   * Minimum video frames for the grid.
   */
  fromCount: number;
  /**
   * Optional. Maximum video frames for the grid.
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

/**
 * Enumeration of the recorder video fonts. Can be passed via the [RecorderLabels.font] parameter.
 * <br>
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare enum RecorderLabelFont {
  ROBOTO_SLAB_SEMI_BOLD = 'RobotoSlab-SemiBold',
  ROBOTO_SLAB_THIN = 'RobotoSlab-Thin',
  ROBOTO_CONDENSED_BOLD = 'RobotoCondensed-Bold',
  ROBOTO_CONDENSED_BOLD_ITALIC = 'RobotoCondensed-BoldItalic',
  ROBOTO_CONDENSED_ITALIC = 'RobotoCondensed-Italic',
  ROBOTO_CONDENSED_LIGHT = 'RobotoCondensed-Light',
  ROBOTO_CONDENSED_LIGHT_ITALIC = 'RobotoCondensed-LightItalic',
  ROBOTO_CONDENSED_REGULAR = 'RobotoCondensed-Regular',
  ROBOTO_FLEX_REGULAR = 'RobotoFlex-Regular',
  ROBOTO_MONO_BOLD = 'RobotoMono-Bold',
  ROBOTO_MONO_BOLD_ITALIC = 'RobotoMono-BoldItalic',
  ROBOTO_MONO_EXTRA_LIGHT = 'RobotoMono-ExtraLight',
  ROBOTO_MONO_EXTRA_LIGHT_ITALIC = 'RobotoMono-ExtraLightItalic',
  ROBOTO_MONO_ITALIC = 'RobotoMono-Italic',
  ROBOTO_MONO_LIGHT = 'RobotoMono-Light',
  ROBOTO_MONO_LIGHT_ITALIC = 'RobotoMono-LightItalic',
  ROBOTO_MONO_MEDIUM = 'RobotoMono-Medium',
  ROBOTO_MONO_MEDIUM_ITALIC = 'RobotoMono-MediumItalic',
  ROBOTO_MONO_REGULAR = 'RobotoMono-Regular',
  ROBOTO_MONO_SEMI_BOLD = 'RobotoMono-SemiBold',
  ROBOTO_MONO_SEMI_BOLD_ITALIC = 'RobotoMono-SemiBoldItalic',
  ROBOTO_MONO_THIN = 'RobotoMono-Thin',
  ROBOTO_MONO_THIN_ITALIC = 'RobotoMono-ThinItalic',
  ROBOTO_SERIF_CONDENSED_BLACK = 'RobotoSerif_Condensed-Black',
  ROBOTO_SERIF_CONDENSED_BLACK_ITALIC = 'RobotoSerif_Condensed-BlackItalic',
  ROBOTO_SERIF_CONDENSED_BOLD = 'RobotoSerif_Condensed-Bold',
  ROBOTO_SERIF_CONDENSED_BOLD_ITALIC = 'RobotoSerif_Condensed-BoldItalic',
  ROBOTO_SERIF_CONDENSED_EXTRA_BOLD = 'RobotoSerif_Condensed-ExtraBold',
  ROBOTO_SERIF_CONDENSED_EXTRA_BOLD_ITALIC = 'RobotoSerif_Condensed-ExtraBoldItalic',
  ROBOTO_SERIF_CONDENSED_EXTRA_LIGHT = 'RobotoSerif_Condensed-ExtraLight',
  ROBOTO_SERIF_CONDENSED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_Condensed-ExtraLightItalic',
  ROBOTO_SERIF_CONDENSED_ITALIC = 'RobotoSerif_Condensed-Italic',
  ROBOTO_SERIF_CONDENSED_LIGHT = 'RobotoSerif_Condensed-Light',
  ROBOTO_SERIF_CONDENSED_LIGHT_ITALIC = 'RobotoSerif_Condensed-LightItalic',
  ROBOTO_SERIF_CONDENSED_MEDIUM = 'RobotoSerif_Condensed-Medium',
  ROBOTO_SERIF_CONDENSED_MEDIUM_ITALIC = 'RobotoSerif_Condensed-MediumItalic',
  ROBOTO_SERIF_CONDENSED_REGULAR = 'RobotoSerif_Condensed-Regular',
  ROBOTO_SERIF_CONDENSED_SEMI_BOLD = 'RobotoSerif_Condensed-SemiBold',
  ROBOTO_SERIF_CONDENSED_SEMI_BOLD_ITALIC = 'RobotoSerif_Condensed-SemiBoldItalic',
  ROBOTO_SERIF_CONDENSED_THIN = 'RobotoSerif_Condensed-Thin',
  ROBOTO_SERIF_CONDENSED_THIN_ITALIC = 'RobotoSerif_Condensed-ThinItalic',
  ROBOTO_SERIF_EXPANDED_BLACK = 'RobotoSerif_Expanded-Black',
  ROBOTO_SERIF_EXPANDED_BLACK_ITALIC = 'RobotoSerif_Expanded-BlackItalic',
  ROBOTO_SERIF_EXPANDED_BOLD = 'RobotoSerif_Expanded-Bold',
  ROBOTO_SERIF_EXPANDED_BOLD_ITALIC = 'RobotoSerif_Expanded-BoldItalic',
  ROBOTO_SERIF_EXPANDED_EXTRA_BOLD = 'RobotoSerif_Expanded-ExtraBold',
  ROBOTO_SERIF_EXPANDED_EXTRA_BOLD_ITALIC = 'RobotoSerif_Expanded-ExtraBoldItalic',
  ROBOTO_SERIF_EXPANDED_EXTRA_LIGHT = 'RobotoSerif_Expanded-ExtraLight',
  ROBOTO_SERIF_EXPANDED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_Expanded-ExtraLightItalic',
  ROBOTO_SERIF_EXPANDED_ITALIC = 'RobotoSerif_Expanded-Italic',
  ROBOTO_SERIF_EXPANDED_LIGHT = 'RobotoSerif_Expanded-Light',
  ROBOTO_SERIF_EXPANDED_LIGHT_ITALIC = 'RobotoSerif_Expanded-LightItalic',
  ROBOTO_SERIF_EXPANDED_MEDIUM = 'RobotoSerif_Expanded-Medium',
  ROBOTO_SERIF_EXPANDED_MEDIUM_ITALIC = 'RobotoSerif_Expanded-MediumItalic',
  ROBOTO_SERIF_EXPANDED_REGULAR = 'RobotoSerif_Expanded-Regular',
  ROBOTO_SERIF_EXPANDED_SEMI_BOLD = 'RobotoSerif_Expanded-SemiBold',
  ROBOTO_SERIF_EXPANDED_SEMI_BOLD_ITALIC = 'RobotoSerif_Expanded-SemiBoldItalic',
  ROBOTO_SERIF_EXPANDED_THIN = 'RobotoSerif_Expanded-Thin',
  ROBOTO_SERIF_EXPANDED_THIN_ITALIC = 'RobotoSerif_Expanded-ThinItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_BLACK = 'RobotoSerif_ExtraCondensed-Black',
  ROBOTO_SERIF_EXTRA_CONDENSED_BLACK_ITALIC = 'RobotoSerif_ExtraCondensed-BlackItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_BOLD = 'RobotoSerif_ExtraCondensed-Bold',
  ROBOTO_SERIF_EXTRA_CONDENSED_BOLD_ITALIC = 'RobotoSerif_ExtraCondensed-BoldItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_EXTRA_BOLD = 'RobotoSerif_ExtraCondensed-ExtraBold',
  ROBOTO_SERIF_EXTRA_CONDENSED_EXTRA_BOLD_ITALIC = 'RobotoSerif_ExtraCondensed-ExtraBoldItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_EXTRA_LIGHT = 'RobotoSerif_ExtraCondensed-ExtraLight',
  ROBOTO_SERIF_EXTRA_CONDENSED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_ExtraCondensed-ExtraLightItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_ITALIC = 'RobotoSerif_ExtraCondensed-Italic',
  ROBOTO_SERIF_EXTRA_CONDENSED_LIGHT = 'RobotoSerif_ExtraCondensed-Light',
  ROBOTO_SERIF_EXTRA_CONDENSED_LIGHT_ITALIC = 'RobotoSerif_ExtraCondensed-LightItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_MEDIUM = 'RobotoSerif_ExtraCondensed-Medium',
  ROBOTO_SERIF_EXTRA_CONDENSED_MEDIUM_ITALIC = 'RobotoSerif_ExtraCondensed-MediumItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_REGULAR = 'RobotoSerif_ExtraCondensed-Regular',
  ROBOTO_SERIF_EXTRA_CONDENSED_SEMI_BOLD = 'RobotoSerif_ExtraCondensed-SemiBold',
  ROBOTO_SERIF_EXTRA_CONDENSED_SEMI_BOLD_ITALIC = 'RobotoSerif_ExtraCondensed-SemiBoldItalic',
  ROBOTO_SERIF_EXTRA_CONDENSED_THIN = 'RobotoSerif_ExtraCondensed-Thin',
  ROBOTO_SERIF_EXTRA_CONDENSED_THIN_ITALIC = 'RobotoSerif_ExtraCondensed-ThinItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_BLACK = 'RobotoSerif_ExtraExpanded-Black',
  ROBOTO_SERIF_EXTRA_EXPANDED_BLACK_ITALIC = 'RobotoSerif_ExtraExpanded-BlackItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_BOLD = 'RobotoSerif_ExtraExpanded-Bold',
  ROBOTO_SERIF_EXTRA_EXPANDED_BOLD_ITALIC = 'RobotoSerif_ExtraExpanded-BoldItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_EXTRA_BOLD = 'RobotoSerif_ExtraExpanded-ExtraBold',
  ROBOTO_SERIF_EXTRA_EXPANDED_EXTRA_BOLD_ITALIC = 'RobotoSerif_ExtraExpanded-ExtraBoldItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_EXTRA_LIGHT = 'RobotoSerif_ExtraExpanded-ExtraLight',
  ROBOTO_SERIF_EXTRA_EXPANDED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_ExtraExpanded-ExtraLightItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_ITALIC = 'RobotoSerif_ExtraExpanded-Italic',
  ROBOTO_SERIF_EXTRA_EXPANDED_LIGHT = 'RobotoSerif_ExtraExpanded-Light',
  ROBOTO_SERIF_EXTRA_EXPANDED_LIGHT_ITALIC = 'RobotoSerif_ExtraExpanded-LightItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_MEDIUM = 'RobotoSerif_ExtraExpanded-Medium',
  ROBOTO_SERIF_EXTRA_EXPANDED_MEDIUM_ITALIC = 'RobotoSerif_ExtraExpanded-MediumItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_REGULAR = 'RobotoSerif_ExtraExpanded-Regular',
  ROBOTO_SERIF_EXTRA_EXPANDED_SEMI_BOLD = 'RobotoSerif_ExtraExpanded-SemiBold',
  ROBOTO_SERIF_EXTRA_EXPANDED_SEMI_BOLD_ITALIC = 'RobotoSerif_ExtraExpanded-SemiBoldItalic',
  ROBOTO_SERIF_EXTRA_EXPANDED_THIN = 'RobotoSerif_ExtraExpanded-Thin',
  ROBOTO_SERIF_EXTRA_EXPANDED_THIN_ITALIC = 'RobotoSerif_ExtraExpanded-ThinItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_BLACK = 'RobotoSerif_SemiCondensed-Black',
  ROBOTO_SERIF_SEMI_CONDENSED_BLACK_ITALIC = 'RobotoSerif_SemiCondensed-BlackItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_BOLD = 'RobotoSerif_SemiCondensed-Bold',
  ROBOTO_SERIF_SEMI_CONDENSED_BOLD_ITALIC = 'RobotoSerif_SemiCondensed-BoldItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_EXTRA_BOLD = 'RobotoSerif_SemiCondensed-ExtraBold',
  ROBOTO_SERIF_SEMI_CONDENSED_EXTRA_BOLD_ITALIC = 'RobotoSerif_SemiCondensed-ExtraBoldItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_EXTRA_LIGHT = 'RobotoSerif_SemiCondensed-ExtraLight',
  ROBOTO_SERIF_SEMI_CONDENSED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_SemiCondensed-ExtraLightItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_ITALIC = 'RobotoSerif_SemiCondensed-Italic',
  ROBOTO_SERIF_SEMI_CONDENSED_LIGHT = 'RobotoSerif_SemiCondensed-Light',
  ROBOTO_SERIF_SEMI_CONDENSED_LIGHT_ITALIC = 'RobotoSerif_SemiCondensed-LightItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_MEDIUM = 'RobotoSerif_SemiCondensed-Medium',
  ROBOTO_SERIF_SEMI_CONDENSED_MEDIUM_ITALIC = 'RobotoSerif_SemiCondensed-MediumItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_REGULAR = 'RobotoSerif_SemiCondensed-Regular',
  ROBOTO_SERIF_SEMI_CONDENSED_SEMI_BOLD = 'RobotoSerif_SemiCondensed-SemiBold',
  ROBOTO_SERIF_SEMI_CONDENSED_SEMI_BOLD_ITALIC = 'RobotoSerif_SemiCondensed-SemiBoldItalic',
  ROBOTO_SERIF_SEMI_CONDENSED_THIN = 'RobotoSerif_SemiCondensed-Thin',
  ROBOTO_SERIF_SEMI_CONDENSED_THIN_ITALIC = 'RobotoSerif_SemiCondensed-ThinItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_BLACK = 'RobotoSerif_SemiExpanded-Black',
  ROBOTO_SERIF_SEMI_EXPANDED_BLACK_ITALIC = 'RobotoSerif_SemiExpanded-BlackItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_BOLD = 'RobotoSerif_SemiExpanded-Bold',
  ROBOTO_SERIF_SEMI_EXPANDED_BOLD_ITALIC = 'RobotoSerif_SemiExpanded-BoldItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_EXTRA_BOLD = 'RobotoSerif_SemiExpanded-ExtraBold',
  ROBOTO_SERIF_SEMI_EXPANDED_EXTRA_BOLD_ITALIC = 'RobotoSerif_SemiExpanded-ExtraBoldItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_EXTRA_LIGHT = 'RobotoSerif_SemiExpanded-ExtraLight',
  ROBOTO_SERIF_SEMI_EXPANDED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_SemiExpanded-ExtraLightItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_ITALIC = 'RobotoSerif_SemiExpanded-Italic',
  ROBOTO_SERIF_SEMI_EXPANDED_LIGHT = 'RobotoSerif_SemiExpanded-Light',
  ROBOTO_SERIF_SEMI_EXPANDED_LIGHT_ITALIC = 'RobotoSerif_SemiExpanded-LightItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_MEDIUM = 'RobotoSerif_SemiExpanded-Medium',
  ROBOTO_SERIF_SEMI_EXPANDED_MEDIUM_ITALIC = 'RobotoSerif_SemiExpanded-MediumItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_REGULAR = 'RobotoSerif_SemiExpanded-Regular',
  ROBOTO_SERIF_SEMI_EXPANDED_SEMI_BOLD = 'RobotoSerif_SemiExpanded-SemiBold',
  ROBOTO_SERIF_SEMI_EXPANDED_SEMI_BOLD_ITALIC = 'RobotoSerif_SemiExpanded-SemiBoldItalic',
  ROBOTO_SERIF_SEMI_EXPANDED_THIN = 'RobotoSerif_SemiExpanded-Thin',
  ROBOTO_SERIF_SEMI_EXPANDED_THIN_ITALIC = 'RobotoSerif_SemiExpanded-ThinItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_BLACK = 'RobotoSerif_UltraCondensed-Black',
  ROBOTO_SERIF_ULTRA_CONDENSED_BLACK_ITALIC = 'RobotoSerif_UltraCondensed-BlackItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_BOLD = 'RobotoSerif_UltraCondensed-Bold',
  ROBOTO_SERIF_ULTRA_CONDENSED_BOLD_ITALIC = 'RobotoSerif_UltraCondensed-BoldItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_EXTRA_BOLD = 'RobotoSerif_UltraCondensed-ExtraBold',
  ROBOTO_SERIF_ULTRA_CONDENSED_EXTRA_BOLD_ITALIC = 'RobotoSerif_UltraCondensed-ExtraBoldItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_EXTRA_LIGHT = 'RobotoSerif_UltraCondensed-ExtraLight',
  ROBOTO_SERIF_ULTRA_CONDENSED_EXTRA_LIGHT_ITALIC = 'RobotoSerif_UltraCondensed-ExtraLightItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_ITALIC = 'RobotoSerif_UltraCondensed-Italic',
  ROBOTO_SERIF_ULTRA_CONDENSED_LIGHT = 'RobotoSerif_UltraCondensed-Light',
  ROBOTO_SERIF_ULTRA_CONDENSED_LIGHT_ITALIC = 'RobotoSerif_UltraCondensed-LightItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_MEDIUM = 'RobotoSerif_UltraCondensed-Medium',
  ROBOTO_SERIF_ULTRA_CONDENSED_MEDIUM_ITALIC = 'RobotoSerif_UltraCondensed-MediumItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_REGULAR = 'RobotoSerif_UltraCondensed-Regular',
  ROBOTO_SERIF_ULTRA_CONDENSED_SEMI_BOLD = 'RobotoSerif_UltraCondensed-SemiBold',
  ROBOTO_SERIF_ULTRA_CONDENSED_SEMI_BOLD_ITALIC = 'RobotoSerif_UltraCondensed-SemiBoldItalic',
  ROBOTO_SERIF_ULTRA_CONDENSED_THIN = 'RobotoSerif_UltraCondensed-Thin',
  ROBOTO_SERIF_ULTRA_CONDENSED_THIN_ITALIC = 'RobotoSerif_UltraCondensed-ThinItalic',
  ROBOTO_SLAB_BLACK = 'RobotoSlab-Black',
  ROBOTO_SLAB_BOLD = 'RobotoSlab-Bold',
  ROBOTO_SLAB_EXTRA_BOLD = 'RobotoSlab-ExtraBold',
  ROBOTO_SLAB_EXTRA_LIGHT = 'RobotoSlab-ExtraLight',
  ROBOTO_SLAB_LIGHT = 'RobotoSlab-Light',
  ROBOTO_SLAB_MEDIUM = 'RobotoSlab-Medium',
  ROBOTO_SLAB_REGULAR = 'RobotoSlab-Regular',
  ROBOTO_BLACK = 'Roboto-Black',
  ROBOTO_BLACK_ITALIC = 'Roboto-BlackItalic',
  ROBOTO_BOLD = 'Roboto-Bold',
  ROBOTO_BOLD_ITALIC = 'Roboto-BoldItalic',
  ROBOTO_LIGHT = 'Roboto-Light',
  ROBOTO_LIGHT_ITALIC = 'Roboto-LightItalic',
  ROBOTO_MEDIUM = 'Roboto-Medium',
  ROBOTO_MEDIUM_ITALIC = 'Roboto-MediumItalic',
  ROBOTO_REGULAR = 'Roboto-Regular',
  ROBOTO_REGULAR_ITALIC = 'Roboto-RegularItalic',
  ROBOTO_THIN = 'Roboto-Thin',
  ROBOTO_THIN_ITALIC = 'Roboto-ThinItalic',
}

/**
 * Enumeration of the recorder label position. Can be passed via the [RecorderLabels.position] parameter.
 * <br>
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare enum RecorderLabelPosition {
  TOP_LEFT = 'top left',
  TOP_CENTER = 'top center',
  TOP_RIGHT = 'top right',
  MIDDLE_LEFT = 'middle left',
  MIDDLE_CENTER = 'middle center',
  MIDDLE_RIGHT = 'middle right',
  BOTTOM_LEFT = 'bottom left',
  BOTTOM_CENTER = 'bottom center',
  BOTTOM_RIGHT = 'bottom right',
}

/**
 * Enumeration of the recorder label text alignment. Can be passed via the [RecorderLabels.textAlign] parameter.
 * <br>
 * Add the following line to your scenario code to use the enum:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare enum RecorderLabelTextAlign {
  TOP_LEFT = 'T+L',
  TOP_CENTER = 'T+C',
  TOP_RIGHT = 'T+R',
  MIDDLE_LEFT = 'M+L',
  MIDDLE_CENTER = 'M+C',
  MIDDLE_RIGHT = 'M+R',
  BOTTOM_LEFT = 'B+L',
  BOTTOM_CENTER = 'B+C',
  BOTTOM_RIGHT = 'B+R',
}

/**
 * An object that specifies video frame with the participants' name settings. Can be passed via the [RecorderVideoParameters.labels] or [UpdateRecorderVideoParameters.labels] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare interface RecorderLabels {
  /**
   * Optional. Participant's label font.
   * The default value is **[RecorderLabelFont.ROBOTO_REGULAR]**
   */
  font?: RecorderLabelFont;
  /**
   * Optional. Participant's label text horizontal and vertical alignment.
   * The default value is **[RecorderLabelTextAlign.MIDDLE_LEFT]**
   */
  textAlign?: RecorderLabelTextAlign;
  /**
   * Optional. Margin space outside the label in pixels.
   * The default value is **8**
   */
  margin?: number;
  /**
   * Optional. Participant's label position.
   * The default value is **[RecorderLabelPosition.BOTTOM_RIGHT]**
   */
  position?: RecorderLabelPosition;
  /**
   * Optional. Participant's label background color in HEX format.
   * The default value is **#c7c7cc**
   */
  background?: string;
  /**
   * Optional. Participant's label color in HEX format.
   * The default value is **#000000**
   */
  color?: string;
  /**
   * Optional. Participant's label width in pixels.
   * The default value is **104**
   */
  width?: number;
  /**
   * Optional. Participant's label height in pixels.
   * The default value is **24**
   */
  height?: number;
}

/**
 * An object that specifies video frame layout priority. Can be passed via the [CallRecordParameters.videoParameters] and [RecorderParameters.videoParameters] parameter.
 * <br>
 * Add the following line to your scenario code to use the type:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare type RecorderLayoutPriority = 'vad' | string[];

/**
 * An object that specifies video layout settings. Can be passed via the [RecorderVideoParameters.layoutSettings] and [UpdateRecorderVideoParameters.layoutSettings] parameter.
 * <br>
 * Add the following line to your scenario code to use the type:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare type RecorderLayout = 'grid' | 'tribune' | 'custom';

/**
 * An object that specifies how to fill a participant's video source to the conference frame. Can be passed via the [RecorderVideoParameters.layoutSettings] and [UpdateRecorderVideoParameters.layoutSettings] parameter.
 * <br>
 * Add the following line to your scenario code to use the type:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare type RecorderObjectFit = 'fill' | 'contain' | 'cover' | 'none';

/**
 * [Recorder] and [ConferenceRecorder] parameters. Can be passed as arguments to the [VoxEngine.createRecorder] method.
 */
declare interface RecorderParameters extends BaseRecorderParameters{
  /**
   * Optional. Name of the recorder for the call history.
   */
  name?: string;
  /**
   * Optional. Speech recognition provider.
   */
  provider?:
    | ASRProfileList.Amazon
    | ASRProfileList.Deepgram
    | ASRProfileList.Google
    | ASRProfileList.Microsoft
    | ASRProfileList.SaluteSpeech
    | ASRProfileList.TBank
    | ASRProfileList.Yandex
    | ASRProfileList.YandexV3;
}

/**
 * Enumeration of the video quality profiles. Can be passed via the [RecorderVideoParameters.profile] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare enum RecorderProfile {
  NHD = 'NHD',
  VGA = 'VGA',
  HD = 'HD',
  FHD = 'FHD',
  QHD = 'QHD',
  '4K' = '4K',
}

/**
 * An object that specifies speaking participant highlight video frame parameters. Can be passed via the [RecorderVideoParameters.vad] or [UpdateRecorderVideoParameters.vad] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare interface RecorderVad {
  /**
   * Optional. Highlighting frame thickness in pixels. For **width > 1280** the default value is **3**, for **width < 1280** the default value is **1**.
   */
  thickness?: number;
  /**
   * Optional. Highlighting frame color in HEX format. The default value is **#009933**.
   */
  color?: string;
}

/**
 * An object that specifies recorder video parameters. Can be passed via the [CallRecordParameters.videoParameters] and [RecorderParameters.videoParameters] parameter.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare interface RecorderVideoParameters extends UpdateRecorderVideoParameters {
  /**
   * Whether to create single video file of multiple participants.
   */
  mixing: boolean;
  /**
   * Optional. Video quality profile.
   */
  profile?: RecorderProfile;
  /**
   * Optional. Video width in pixels.
   */
  width?: number;
  /**
   * Optional. Video height in pixels.
   */
  height?: number;
  /**
   * Optional. Video bitrate in kbps.
   */
  bitrate?: number;
  /**
   * Optional. Video frames per second.
   */
  fps?: number;
}

/**
 * Represents an audio and video recorder.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare class Recorder {
  /**
   * Adds a handler for the specified [RecorderEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [RecorderEvents.Stopped])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _RecorderEvents>(
    event: RecorderEvents | T,
    callback: (event: _RecorderEvents[T]) => any,
  ): void;

  /**
   * Removes a handler for the specified [RecorderEvents] event.
   * @param event Event class (i.e., [RecorderEvents.Stopped])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _RecorderEvents>(
    event: RecorderEvents | T,
    callback?: (event: _RecorderEvents[T]) => any,
  ): void;

  /**
   * Returns the recorder's id.
   */
  id(): string;

  /**
   * Whether to mute whole record without detaching media sources from it.
   * @param doMute Mute/unmute switch
   */
  mute(doMute: boolean): void;

  /**
   * Stops recording and triggers the [RecorderEvents.Stopped] event.
   */
  stop(): void;
}

declare function require(module: Modules): void;

/**
 * Custom parameters for [WebSocket] interaction. Can be passed as arguments to the [VoxMediaUnit] **sendMediaTo** method.
 */
declare interface SendMediaParameters {
  tag: string;
  customParameters?: any;
  encoding?: WebSocketAudioEncoding;
}

/**
 * @event
 */
declare enum SequencePlayerEvents {
  /**
   * Triggered when [SequencePlayer] created.
   * @typedef _SequencePlayerCreatedEvent
   */
  Created = 'SequencePlayer.Created',

  /**
   * Triggered by the [VoxEngine.createSequencePlayer] methods when<br>
   * 1) all the segments audio files download to the Voximplant cache is finished;<br>
   * 2) all the audio files is found in the cache (i.e., it is in the cache before).
   * @typedef _SequencePlayerPlaybackReadyEvent
   */
  PlaybackReady = 'SequencePlayer.PlaybackReady',

  /**
   * Triggered when playback of the first SequencePlayer segment starts.
   * @typedef _SequencePlayerStartedEvent
   */
  Started = 'SequencePlayer.Started',

  /**
   * Triggers as a result of the [SequencePlayer.stop] method call.
   * @typedef _SequencePlayerStoppedEvent
   */
  Stopped = 'SequencePlayer.Stopped',

  /**
   * Triggered when playback has finished successfully or with an error.
   * @typedef _SequencePlayerPlaybackFinishedEvent
   */
  PlaybackFinished = 'SequencePlayer.PlaybackFinished',

  /**
   * Triggered when playback has finished with an error
   * @typedef _SequencePlayerErrorEvent
   */
  Error = 'SequencePlayer.Error',

  /**
   * Triggered when [SequencePlayer.addMarker] is reached.
   * @typedef _SequencePlayerPlaybackMarkerReachedEvent
   */
  PlaybackMarkerReached = 'SequencePlayer.PlaybackMarkerReached',
}

/**
 * @private
 */
declare interface _SequencePlayerEvents {
  [SequencePlayerEvents.Created]: _SequencePlayerCreatedEvent;
  [SequencePlayerEvents.PlaybackReady]: _SequencePlayerPlaybackReadyEvent;
  [SequencePlayerEvents.Started]: _SequencePlayerStartedEvent;
  [SequencePlayerEvents.Stopped]: _SequencePlayerStoppedEvent;
  [SequencePlayerEvents.Error]: _SequencePlayerErrorEvent;
  [SequencePlayerEvents.PlaybackFinished]: _SequencePlayerPlaybackFinishedEvent;
  [SequencePlayerEvents.PlaybackMarkerReached]: _SequencePlayerPlaybackMarkerReachedEvent;
}

/**
 * @private
 */
declare interface _SequencePlayerEvent {
  /**
   * Sequence player that generated the event
   */
  sequencePlayer: SequencePlayer;
}

/**
 * @private
 */
declare interface _SequencePlayerCreatedEvent extends _SequencePlayerEvent {}

/**
 * @private
 */
declare interface _SequencePlayerPlaybackReadyEvent extends _SequencePlayerEvent {}

/**
 * @private
 */
declare interface _SequencePlayerStartedEvent extends _SequencePlayerEvent {}

/**
 * @private
 */
declare interface _SequencePlayerStoppedEvent extends _SequencePlayerEvent {}

/**
 * @private
 */
declare interface _SequencePlayerPlaybackFinishedEvent extends _SequencePlayerEvent {
  /**
   * Error message
   */
  error?: string;
}

/**
 * @private
 */
declare interface _SequencePlayerErrorEvent extends _SequencePlayerEvent {
  /**
   * Error message
   */
  error: string;
}

/**
 * @private
 */
declare interface _SequencePlayerPlaybackMarkerReachedEvent extends _SequencePlayerEvent {
  /**
   * The marker offset
   */
  offset: number;
}

/**
 * Sequence player segment, represented by TTS or URL [Player]. Can be passed via the [SequencePlayerParameters.segments] parameter.
 */
declare type SequencePlayerSegment = TTSPlayerSegment | URLPlayerSegment;

/**
 * Represents an instance with segments represented by audio and URL players.
 * <br>
 * Can be used by calling the [VoxEngine.createSequencePlayer] method.
 */
declare class SequencePlayer {
  /**
   * Adds a handler for the specified [SequencePlayerEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [SequencePlayerEvents.PlaybackFinished])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _SequencePlayerEvents>(
    event: SequencePlayerEvents | T,
    callback: (event: _SequencePlayerEvents[T]) => any,
  ): void;

  /**
   * Removes a handler for the specified [SequencePlayerEvents] event.
   * @param event Event class (i.e., [SequencePlayerEvents.PlaybackFinished])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _SequencePlayerEvents>(
    event: SequencePlayerEvents | T,
    callback?: (event: _SequencePlayerEvents[T]) => any,
  ): void;

  /**
   * Returns the sequence player's id.
   */
  id(): string;

  /**
   * Pauses playback. To continue the playback use the [SequencePlayer.resume] method.
   */
  pause(): void;

  /**
   * Resumes playback after the [SequencePlayer.pause] method is called.
   */
  resume(): void;

  /**
   * Stops playback. The current sequence player's instance with all its segments is destroyed.
   */
  stop(): void;

  /**
   * Adds a playback marker to the specified segment. The [SequencePlayerEvents.PlaybackMarkerReached] event is triggered when the marker is reached.
   * @param offset Positive/negative offset in milliseconds from the start/end of media
   * @param segment The segment to add the marker
   */
  addMarker(offset: number, segment: PlaybackParameters): void;

  /**
   * Starts sending media from the sequence player to the media unit.
   * @param mediaUnit Media unit that receives media
   * @param parameters Optional. WebSocket interaction only parameters
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

  /**
   * Stops sending media from the sequence player to the media unit.
   * @param mediaUnit Media unit that does not need to receive media from this conference anymore
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;
}

/**
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.SmartQueue);
 * ```
 * @event
 */
declare enum SmartQueueEvents {
  /**
   * The task is waiting for distribution to an agent. This event occurs every 10 or 15 seconds and contains information about task's position in a queue and approximate response time.
   * @typedef _SmartQueueWaitingEvent
   */
  Waiting = 'SmartQueue.Waiting',
  /**
   * An agent responded to the task, e.g. answered the call. This event indicates that SmartQueue processed the task successfully.
   * @typedef _SmartQueueOperatorReachedEvent
   */
  OperatorReached = 'SmartQueue.OperatorReached',
  /**
   * The task has been enqueued successfully.
   * @typedef _SmartQueueEnqueueSuccessEvent
   */
  EnqueueSuccess = 'SmartQueue.EnqueueSuccess',
  /**
   * SmartQueue distributed the task to an agent. This event can occur multiple times if an agent does not respond during the timeout.
   * @typedef _SmartQueueTaskDistributedEvent
   */
  TaskDistributed = 'SmartQueue.DistributeTask',
  /**
   * The client disconnected.<br><br>When you process the <b>ClientDisconnected</b> event, call the <code>e.cancel()</code> method inside the event manually to cancel the task.
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
   * The task is waiting for distribution to an agent. This event occurs every 10 or 15 seconds and contains information about task's position in a queue and approximate response time.
   */
  [SmartQueueEvents.Waiting]: _SmartQueueWaitingEvent;
  /**
   * An agent responded to the task, e.g. answered the call. This event indicates that SmartQueue processed the task successfully.
   */
  [SmartQueueEvents.OperatorReached]: _SmartQueueOperatorReachedEvent;
  /**
   * The task has been enqueued successfully.
   */
  [SmartQueueEvents.EnqueueSuccess]: _SmartQueueEnqueueSuccessEvent;
  /**
   * SmartQueue distributed the task to an agent. This event can occur multiple times if an agent does not respond during the timeout.
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
   * A [SmartQueue] task
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
declare interface _SmartQueueEnqueueSuccessEvent extends _SmartQueueEvent {
}

/**
 * @private
 */
declare interface _SmartQueueTaskDistributedEvent extends _SmartQueueEvent {
  /**
   * The id of the task's responsible agent
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
  cancel: Function;
}

/**
 * @private
 */
declare interface _SmartQueueTaskCanceledEvent extends _SmartQueueEvent {
  /**
   * The [SmartQueue] termination status
   */
  status: TerminationStatus;
  /**
   * The [SmartQueue] task's error description
   */
  description: string;
}

/**
 * @private
 */
declare interface _SmartQueueErrorEvent extends _SmartQueueEvent {
  /**
   * The [SmartQueue] error code
   */
  type: TerminationStatus;
  /**
   * The [SmartQueue] task's error description
   */
  description: string;
}

/**
 * The [SmartQueue] task distribution mode. Can be passed via the [SmartQueueOperatorSettings.mode] parameter.
 */
declare enum SmartQueueOperatorSettingsMode {
  /**
   * Cancels the task if it is impossible to select the specific operator
   */
  STRICT = 'STRICT',
  /**
   * Distributes the task to another operator if it is impossible to select the specific operator
   */
  SMART = 'SMART',
}

/*
 * The [SmartQueueTask] operator settings. Can be passed via the [SmartQueueTaskParameters.operatorSettings] parameter.
 */
declare interface SmartQueueOperatorSettings {
  /**
   * Operator's id.
   */
  operatorId: number;
  /**
   * Task distribution mode.
   */
  mode: SmartQueueOperatorSettingsMode;
  /**
   * Timeout in seconds to search for a specific operator. The default value is **0**.
   */
  timeout: number;
}

/*
 * The [SmartQueue] skill level is used to characterize an agent or a requirement for a task. Can be passed via the [SmartQueueTaskParameters.skills] parameter.
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
 * Settings of a certain [SmartQueueTask]. Can be passed as arguments to the [VoxEngine.enqueueTask] method.
 */
declare interface SmartQueueTaskParameters {
  /**
   * Current task's Call object.
   */
  call?: Call;
  /**
   * Task's operator settings.
   */
  operatorSettings?: SmartQueueOperatorSettings;
  /**
   * A timeout in seconds for the task to be accepted by an agent.
   */
  timeout: number;
  /**
   * The task's priority. Accept values from 1 to 100. The default value is **50**.
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
   * Custom data text string for the current task. After you specify the data in this field, you can find it in the [SmartQueueState_Task](/docs/references/httpapi/structure/smartqueuestate_task) object for this task. To get this object, call the [GetSQState](/docs/references/httpapi/smartqueue#getsqstate) method.
   */
  customData: string;
  /**
   * Optional. Custom parameters (SIP headers) to be passed with the task. Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   */
  extraHeaders?: { [header: string]: string };
  /**
   * Whether the call has video support. Please note that prices for audio only and video calls are different.
   */
  video: boolean;
  /**
   * Internal information about codecs.
   */
  scheme: string;
  /**
   * Maximum possible video bitrate for the customer device in kbps
   */
  maxVideoBitrate: number;
}

/*
 * A [SmartQueue] task's status enumeration value.
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

/**
 * A [SmartQueue] task is for a certain agent, which can be a call or a chat.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.SmartQueue);
 * ```
 */
declare class SmartQueueTask {
  /**
   * Current status of the task, whether it is distributing, connecting, connected, ended or failed.
   */
  status: SmartQueueTaskStatus;
  /**
   * Reason of task's termination.
   */
  terminationStatus: TerminationStatus | null;
  /**
   * The client's Call object.
   */
  clientCall: Call | null;
  /**
   * The agent's Call object.
   */
  agentCall: Call | null;
  /**
   * SmartQueue task's settings, such as required skills, priority, queue and more.
   */
  settings: SmartQueueTaskParameters;
  /**
   * A [SmartQueue] task's ID.
   */
  id: string;

  /**
   * Ends the current task.
   */
  end(description: string): void;

  /**
   * Adds a handler for the specified [SmartQueueEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [SmartQueueEvents.OperatorReached])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _SmartQueueEvents>(
    event: SmartQueueEvents | T,
    callback: (event: _SmartQueueEvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [SmartQueueEvents] event.
   * @param event Event class (i.e., [SmartQueueEvents.OperatorReached])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _SmartQueueEvents>(
    event: SmartQueueEvents | T,
    callback?: (event: _SmartQueueEvents[T]) => any
  ): void;
}

/*
 * A [SmartQueue] object.
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
 * The parameters can be passed as arguments to the [Call.startPlayback] method.
 */
declare interface StartPlaybackParameters {
  /*
   * Whether to loop playback.
   */
  loop?: boolean;
  /**
   * Whether to use progressive playback. If **true**, the file is delivered in chunks which reduces delay before a method call and playback. The default value is **false**.
   */
  progressivePlayback?: boolean;
}

/**
 * Result of the [get](/docs/references/voxengine/applicationstorage#get), [put](/docs/references/voxengine/applicationstorage#put), and [delete](/docs/references/voxengine/applicationstorage#delete) methods.
 * <br>
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
 * <br>
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
 * Add the following line to your scenario code to use the events:
 * ```
 * require(Modules.StreamingAgent);
 * ```
 * @event
 */
declare enum StreamingAgentEvents {
  /**
   * Triggered when a streaming object is connected to a streaming platform.
   * @typedef _StreamingAgentConnectedEvent
   */
  Connected = 'StreamingAgent.Connected',
  /**
   * Triggered when connection to a streaming platform is failed.
   * @typedef _StreamingAgentConnectionFailedEvent
   */
  ConnectionFailed = 'StreamingAgent.ConnectionFailed',
  /**
   * Triggers if a streaming object cannot be created, *e.g., due to incorrect server url*.
   * @typedef _StreamingAgentErrorEvent
   */
  Error = 'StreamingAgent.Error',
  /**
   * Triggered when a streaming object is disconnected from a streaming platform.
   * @typedef _StreamingAgentDisconnectedEvent
   */
  Disconnected = 'StreamingAgent.Disconnected',
  /**
   * Triggered when a stream is successfully started.
   * @typedef _StreamingAgentStreamStartedEvent
   */
  StreamStarted = 'StreamingAgent.Stream.Started',
  /**
   * Triggered when a stream is stopped.
   * @typedef _StreamingAgentStreamStoppedEvent
   */
  StreamStopped = 'StreamingAgent.Stream.Stopped',
  /**
   * Triggered when a streaming object caused an error, *e.g., due to a codec mismatch*.
   * @typedef _StreamingAgentStreamErrorEvent
   */
  StreamError = 'StreamingAgent.Stream.Error',
  /**
   * Triggered when there is audio data in the stream.
   * @typedef _StreamingAgentAudioStreamCreatedEvent
   */
  AudioStreamCreated = 'StreamingAgent.Stream.AudioStarted',
  /**
   * Triggered when there is video data in the stream.
   * @typedef _StreamingAgentVideoStreamCreatedEvent
   */
  VideoStreamCreated = 'StreamingAgent.Stream.VideoStarted',
  /**
   * Triggered when the audio stream is switched.
   * @typedef _StreamingAgentAudioSwitchedEvent
   */
  AudioSwitched = 'StreamingAgent.Stream.AudioSwitched',
  /**
   * Triggered when the video stream is switched.
   * @typedef _StreamingAgentVideoSwitchedEvent
   */
  VideoSwitched = 'StreamingAgent.Stream.VideoSwitched',
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
  [StreamingAgentEvents.AudioStreamCreated]: _StreamingAgentAudioStreamCreatedEvent;
  [StreamingAgentEvents.VideoStreamCreated]: _StreamingAgentVideoStreamCreatedEvent;
  [StreamingAgentEvents.AudioSwitched]: _StreamingAgentAudioSwitchedEvent;
  [StreamingAgentEvents.VideoSwitched]: _StreamingAgentSwitchedEvent;
}

/**
 * @private
 */
declare interface _StreamingAgentEvent {
  /**
   * Streaming object that triggered the event.
   */
  streamingAgent: StreamingAgent;
}

/**
 * @private
 */
declare interface _StreamingAgentReasonedEvent extends _StreamingAgentEvent {
  /**
   * Reason why the stream is switched. Possible values are: **New stream**, **Set stream**.
   */
  reason: string;
}

/**
 * @private
 */
declare interface _StreamingAgentConnectedEvent extends _StreamingAgentReasonedEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentConnectionFailedEvent extends _StreamingAgentReasonedEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentErrorEvent extends _StreamingAgentReasonedEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentDisconnectedEvent extends _StreamingAgentReasonedEvent {
}

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
declare interface _StreamingAgentStreamStartedEvent extends _StreamingAgentStreamEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentStreamStoppedEvent extends _StreamingAgentStreamEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentStreamErrorEvent extends _StreamingAgentStreamEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentStreamCreatedEvent extends _StreamingAgentEvent {
  /**
   * Id of an audio or video track. Equals to -1 if there is no track.
   */
  trackId: number;
}

/**
 * @private
 */
declare interface _StreamingAgentAudioStreamCreatedEvent extends _StreamingAgentStreamCreatedEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentVideoStreamCreatedEvent extends _StreamingAgentStreamCreatedEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentSwitchedEvent extends _StreamingAgentReasonedEvent {
  /**
   * Id of an audio or video track. Equals to -1 if there is no track.
   */
  trackId: number;
}

/**
 * @private
 */
declare interface _StreamingAgentAudioSwitchedEvent extends _StreamingAgentSwitchedEvent {
}

/**
 * @private
 */
declare interface _StreamingAgentVideoSwitchedEvent extends _StreamingAgentSwitchedEvent {
}

/**
 * [StreamingAgent] parameters. Can be passed as arguments to the [VoxEngine.createStreamingAgent] method.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.StreamingAgent);
 * ```
 */
declare interface StreamingAgentParameters {
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
 * The [StreamingAgent] termination status
 */
declare interface StreamingAgentTrack {
  /**
   * The kind of the track
   */
  kind: string,
  /**
   * The id of the track
   */
  trackId: string,
}

/**
 * Represents a streaming object to interact with streaming platforms.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.StreamingAgent);
 * ```
 */
declare class StreamingAgent {
  /**
   * Adds a handler for the specified [StreamingAgentEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [StreamingAgentEvents.Connected])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _StreamingAgentEvents>(
    event: StreamingAgentEvents | T,
    callback: (event: _StreamingAgentEvents[T]) => any,
  ): void;

  /**
   * Removes a handler for the specified [StreamingAgentEvents] event.
   * @param event Event class (i.e., [StreamingAgentEvents.Connected])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _StreamingAgentEvents>(
    event: StreamingAgentEvents | T,
    callback?: (event: _StreamingAgentEvents[T]) => any,
  ): void;

  /**
   * Returns the StreamingAgent's id.
   */
  id(): string;

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
  audioTracks(): StreamingAgentTrack[];

  /**
   * Gets the list of all current video tracks.
   */
  videoTracks(): StreamingAgentTrack[];

  /**
   * Sets a certain audio and/or video track as active.
   * If an active video track is set, it is not replaced by the new one unlike in the default mode.
   * Default mode: The active video track is the one that started sending data last. The active audio track is always the first one.
   * To return to the default mode, set the track IDs equal to -1.
   * @param tracks Audio and video track to set as active
   */
  setActiveTrack(tracks: { audioTrack?: number; videoTrack?: number }): void;
}

/**
 * The [SmartQueue] task's waiting code
 */
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

/**
 * The [SmartQueue] termination status
 */
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
 * [Player] parameters. Can be passed as arguments to the [VoxEngine.createToneScriptPlayer] method.
 */
declare interface ToneScriptPlayerParameters {
  /**
   * Optional. Whether to loop playback.
   */
  loop?: boolean;
  /**
   * Optional. Whether to use progressive playback. If **true**, the generated tone is delivered in chunks which reduces delay before a method call and playback. The default value is **false**.
   */
  progressivePlayback?: boolean;
}

/**
 * List of available values for the [CallRecordParameters.provider] parameter.
 * <br>
 * Note that the T-Bank VoiceKit and Yandex Speechkit supports only 'ASRLanguage.RUSSIAN_RU' language.
 * <br>
 * Add the following line to your scenario code to use the enum:
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
     * T-Bank
     * @const
     */
    TBANK = 'tcs',
}
/**
 * TTS [Player] parameters. Can be passed via the [SequencePlayerParameters.segments] parameter.
 * <br>
 * Same as the [VoxEngine.createTTSPlayer] method arguments. Has a similar interface to [TTSPlaybackParameters](/docs/references/avatarengine/ttsplaybackparameters).
 */
declare interface TTSPlayerSegment {
  /**
   * Text to synthesize.
   */
  text: string;
  /**
   * Optional. [Player](/docs/references/voxengine/player) parameters: language, progressivePlayback, volume, rate, etc.
   */
  parameters?: TTSPlayerParameters;
}

/**
 * Updates the current video recorder options. Can be passed as arguments to the [ConferenceRecorder.update] method.
 * <br>
 * Add the following line to your scenario code to use the interface:
 * ```
 * require(Modules.Recorder);
 * ```
 */
declare interface UpdateRecorderVideoParameters {
  /**
   * Optional. Video layout settings. If set to **grid**, all the video frames are the same size. If set to **tribune**, one active video frame is bigger than the others. If set to **custom**, you need to provide a 'layout' option with an object that specifies custom layout settings.
   */
  layout?: RecorderLayout;
  /**
   * Optional. If 'layout' option is set to **custom**, specifies custom video layout settings.
   */
  layoutSettings?: RecorderDrawArea[];
  /**
   * Optional. If 'layout' option is set to **tribune**, specifies which frame is bigger than the others. Set to **vad** if you want the bigger frame to change to the speaking participant, or specify the participant's ID to show one person constantly.
   */
  layoutPriority?: RecorderLayoutPriority;
  /**
   * Optional. Whether to show the participants' names on their video frames.
   */
  labels?: RecorderLabels;
  /**
   * Optional. Whether to highlight video frame of the speaking participant.
   */
  vad?: RecorderVad;
  /**
   * Optional. HTML color code for the video file background.
   */
  background?: string;
  /**
   * Optional. Video frame's direction, left to right or right to left.
   */
  direction?: RecorderDirection;
  /**
   * Optional. How to fill a participant's video source to the conference frame.
   */
  objectFit?: RecorderObjectFit;
  /**
   * Optional. A container to store custom data for the current recorder.
   */
  customData?: Object;
}

/**
 * URL [Player] parameters. Can be passed via the [SequencePlayerParameters.segments] parameter.
 * <br>
 * Same as the [VoxEngine.createURLPlayer] method arguments. Has a similar interface to [URLPlaybackParameters](/docs/references/avatarengine/urlplaybackparameters).
 */
declare interface URLPlayerSegment {
  /**
   * Url of an audio file. Supported formats are: mp3, ogg, flac, and wav (mp3, speex, vorbis, flac, and wav codecs respectively). Maximum file size is 10 Mb.
   */
  url: string;
  /**
   * Optional. URL [Player](/docs/references/voxengine/player) parameters.
   */
  parameters?: URLPlayerParameters;
}

declare namespace VoxEngine {
  /**
   * Adds a handler for the specified [AppEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [AppEvents.Started])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  function addEventListener<T extends keyof _AppEvents>(
    event: AppEvents | T,
    callback: (event: _AppEvents[T]) => any
  ): void;
}

declare namespace VoxEngine {
  /**
   * Allows accepting incoming connections to ensure WebSocket bidirectional exchange.
   */
  function allowWebSocketConnections(): void;
}

declare namespace VoxEngine {
  /**
   * Makes a call to a conference via Conference module. If there is no such conference, it is created in the first method's call. The method is designed to be called in a simple incoming scenario, then it can trigger another special scenario which contains logic of the conference.
   * The method can trigger the Failed event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param conferenceId ID of the conference. The parameter has to be the same as the pattern in the rule so the method triggers appropriate rule with conference logic.
   * @param callerid CallerID of the caller that is displayed to the user. Spaces usage is not allowed. Normally it is some phone number that can be used for callback. IMPORTANT: you cannot use test numbers rented from Voximplant as CallerID, use only real numbers.
   * @param displayName Name of the caller that is displayed to the user. Normally it is a human-readable version of CallerID, e.g. a person's name.
   * @param headers Optional. SIP headers to be passed with a call to conference. Custom header names have to begin with the 'X-' prefix. The "X-" headers can be handled by a SIP phone or WEB SDK (e.g. see the [incomingCall](/docs/references/websdk/voximplant/events#incomingcall) event). Example: {'X-header':'value'}
   * @param scheme Optional. Internal information about codecs from the [AppEvents.CallAlerting] event.
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
   * Starts an outgoing call to the specified phone number. Calls that are more expensive than 20 cents per minute and calls to Africa are blocked by default for security reasons.
   * The method can trigger the [CallEvents.Failed] event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param number phone number to start a call to in the international format (E.164)
   * @param callerid CallerID of the caller that is displayed to the user. Spaces usage is not allowed. A valid phone number that can be used to call back is required. Following phone numbers can be used:
   * * A real phone number that is [rented](https://manage.voximplant.com/numbers/my_numbers) from Voximplant. **IMPORTANT**: test numbers cannot be used.
   * * Any phone number that is [verified](https://manage.voximplant.com/settings/caller_ids) via an automated call from Voximplant and confirmation code.
   * * A phone number from an incoming call to the rented number. It can be retrieved as [Caller ID](/docs/references/voxengine/call#callerid).
   * @param parameters Optional. Call parameters
   */
  function callPSTN(number: string, callerid: string, parameters?: CallPSTNParameters): Call;
}

declare namespace VoxEngine {
  /**
   * Starts an outgoing call to the external SIP system or to another user of the same application. Supported codecs are: [G.722](https://www.itu.int/rec/T-REC-G.722), [G.711 (u-law and a-law)](https://www.itu.int/rec/T-REC-G.711), [Opus](https://opus-codec.org/), [ILBC](https://webrtc.org/license/ilbc-freeware/), [H.264](https://www.itu.int/rec/T-REC-H.264), [VP8](https://tools.ietf.org/html/rfc6386). The method can trigger the [CallEvents.Failed] event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param to SIP URI to make a call to. Example of an external call: **sip:alice@example.org**. Examples with TLS usage: **sips:alice@example.org:5061** ; **alice@example.org:5061;transport=tls**. The format for calls to another user of the same Voximplant application: user-of-the-application@application.account.voximplant.com
   * @param parameters Call parameters. Note that if this parameter is not an object, it is treated as "callerid". Further parameters are treated as "displayName", "password", "authUser", "extraHeaders", "video", "outProxy" respectively
   * @param scheme Internal information about codecs from the [AppEvents.CallAlerting] event
   */
  function callSIP(to: string, parameters?: CallSIPParameters, scheme?: Object): Call;
}

declare namespace VoxEngine {
  /**
   * Start an outgoing call to the specified Voximplant user in peer-to-peer mode.
   * The JavaScript scenario with this method and the destination user should be both within the same Voximplant application.
   * Audio playback and recording does not work. P2P mode is available only for calls between SDKs.
   * The method can trigger the [CallEvents.Failed] event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details. **IMPORTANT**: calling this method makes impossible to use the non-P2P mode for a new call and specified incomingCall.
   * So the following methods cannot be used: [Call.say], [Call.sendDigits], [Call.sendMediaTo], [Call.stopMediaTo].
   * @param incomingCall incoming call that needs to be forwarded
   * @param username Name of the Voximplant user to call
   * @param parameters Call parameters
   */
  function callUserDirect(
    incomingCall: Call,
    username: string,
    parameters: CallUserDirectParameters
  ): Call;
}

declare namespace VoxEngine {
  /**
   * Starts an outgoing call to the specified Voximplant user. The JavaScript scenario that uses this method and user being called should be both associated with the same Voximplant application.
   * The method can trigger the [CallEvents.Failed] event in 60 sec, see the [session limits](/docs/guides/voxengine/limits) for details.
   * @param parameters Call parameters
   */
  function callUser(parameters: CallUserParameters): Call;
}

declare namespace VoxEngine {
  /**
   * Creates a new [ASR] (speech recognizer) instance and starts recognition. You can attach sources later via the [VoxMediaUnit] **sendMediaTo** method.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.ASR);
   * ```
   * @param parameters ASR parameters. IMPORTANT: the **profile** parameter is required, the other parameters are optional
   */
  function createASR(parameters: ASRParameters): ASR;
}

declare namespace VoxEngine {
  /**
   * Creates a new [Conference] instance. You can attach media streams later via the [Conference.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.Conference);
   * ```
   * @param parameters Conference parameters
   */
  function createConference(parameters: ConferenceParameters): Conference;
}

declare namespace VoxEngine {
  /**
   * Creates a new [Recorder] (audio recorder) or [ConferenceRecorder] (conference recorder) object. You can attach sources later via the [VoxMediaUnit] **sendMediaTo** method.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.Recorder);
   * ```
   * @param parameters Recorder parameters. Note that if the first parameter is not an object, it is treated as 'name', with second optional parameter as 'secure' boolean flag, default to 'false'.
   */
  function createRecorder(parameters?: RecorderParameters): Recorder | ConferenceRecorder;
}

declare namespace VoxEngine {
  /**
   * Creates a new [SequencePlayer] instance. You can attach media streams later via the [SequencePlayer.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * @param parameters Sequence player parameters
   **/
  function createSequencePlayer(parameters: SequencePlayerParameters): SequencePlayer;
}

declare namespace VoxEngine {
  /**
   * Creates a new [StreamingAgent](streaming) instance. You can attach sources later via the [VoxMediaUnit] **sendMediaTo** method.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.StreamingAgent);
   * ```
   * @param parameters Streaming agent parameters
   */
  function createStreamingAgent(parameters: StreamingAgentParameters): StreamingAgent;
}

declare namespace VoxEngine {
  /**
   * Creates a new [Player](audio player) instance with the specified [ToneScript](https://en.wikipedia.org/wiki/ToneScript) sequence. You can attach media streams later via the [Player.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * @param script ToneScript string
   * @param parameters Optional. Tone script player parameters
   **/
  function createToneScriptPlayer(script: string, parameters?: ToneScriptPlayerParameters): Player;
}

declare namespace VoxEngine {
  /**
   * Creates a new [Player] (audio player) instance with specified text (TTS is used to play the text). You can attach media streams later via the [Player.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * If the text length exceeds 1500 characters, the [PlayerEvents.PlaybackFinished] event is triggered with error description. After the very first playing, a phrase is cached; each createTTSPlayer instance stores the cache data up to 2 weeks. Note that cache addresses only the URL, without additional headers. The cached phrase is available for all applications and further sessions.
   * @param text Text to synthesize
   * @param parameters Optional. TTS player parameters
   **/
  function createTTSPlayer(text: string, parameters?: TTSPlayerParameters): Player;
}

declare namespace VoxEngine {
  /**
   * Creates a new [Player] (audio player) instance with specified audio file URL. You can attach media streams later via the [Player.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * <br>
   * After the very first playback, a file is cached; each
   * 'createURLPlayer' instance stores the cache data up to 2 weeks.
   * Note that cache addresses only the URL, without additional headers.
   * The cached file is available for all applications and further sessions.
   * <br>
   * File download has a timeout of 12 seconds. Reaching this timeout causes the "Timeout is reached" error.
   * <br>
   * You can attach media streams later via the [Player.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * method etc. IMPORTANT: each call object can send media to any number of other calls (media units), but can receive only one audio stream. A new incoming stream always replaces the previous one.
   * @param request URL player request
   * @param parameters Optional. URL player parameters
   **/
  function createURLPlayer(request: URLPlayerRequest, parameters?: URLPlayerParameters): Player;
}

declare namespace VoxEngine {
  /**
   * Creates a new [WebSocket] object. You can attach media streams later via the [WebSocket.sendMediaTo] or [VoxEngine.sendMediaBetween] methods.
   * @param url URL to which to connect (wss:// + domain + path).
   * @param protocols Either a single protocol string or an array of protocol strings. The default value is **chat**.
   */
  function createWebSocket(url: string, protocols: WebSocketParameters): WebSocket;
}

declare namespace VoxEngine {
  /**
   * Set or get custom string associated with current JavaScript session.
   * There are two kinds of the customData values: one is for JavaScript session (i.e., VoxEngine object), another is for the particular call (i.e., Call.customData and web SDK parameter of the method).
   * It is possible to use them at the same time because they are independent entities. Remember that if you receive some value from web SDK, it does not overwrite the VoxEngine's value. Any of customData's type values can be later obtained from call history via management API or control panel.
   * @param customData Optional. Custom session data to set. Maximum size is 200 bytes
   */
  function customData(customData?: string): string;
}

declare namespace VoxEngine {
  /**
   * Destroys an existing conference.
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.Conference);
   * ```
   * @param conference
   */
  function destroyConference(conference: Conference): void;
}

declare namespace VoxEngine {
  /**
   * Adds all default event listeners to pass signaling information between two calls. The source code of the method is available on [GitHub](https://github.com/voximplant/easyprocess).
   * @param call1 incoming alerting call
   * @param call2 Newly created outgoing call
   * @param onEstablishedCallback Function to be called once the call is established. Both call1 and call2 are passed to this function as parameters
   * @param direct Whether the call is in the P2P mode. It is The default value is **false**.
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
   * <br>
   * Add the following line to your scenario code to use the function:
   * ```
   * require(Modules.ACD);
   * ```
   * @param queueName The name of the queue, to where the call is directed. Queue name must be specified exactly as in the control panel
   * @param callerid ID of the caller which is put to the queue. After request is dispatched to the agent, it is possible to get this ID by assigning a handler to the [ACDEvents.OperatorReached] event. The call is stored in the operatorCall property, so you can use the Call.callerid() method. IMPORTANT: virtual numbers rented from Voximplant cannot be used as CallerID, use only real numbers
   * @param parameters Optional. ACD request parameters
   */
  function enqueueACDRequest(
    queueName: string,
    callerid: string,
    parameters?: ACDEnqueueParameters
  ): ACDRequest;
}

declare namespace VoxEngine {
  /**
   * Appends the task to the [SmartQueue].
   */
  function enqueueTask(parameters: SmartQueueTaskParameters): SmartQueueTask;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an incoming call to PSTN. The method handles numbers only in the E.164 format by default. If you need to handle a number in another format, pass an additional function (as a parameter) to the method. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param numberTransform Optional. Function used to transform dialed number to international format. This function accepts dialed number and returns phone number in E.164 format
   * @param onEstablishedCallback Optional. Function that is invoked after a call is established. Both calls (incoming and outgoing) are passed to this function
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
   * Helper function to forward an incoming call to a dialed SIP URI. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param onEstablishedCallback Optional. Function that is invoked after call is established. Both calls (incoming and outgoing) are passed to this function
   * @param video Whether the call has video support. Please note that the price for audio-only and video calls is different!
   */
  function forwardCallToSIP(
    onEstablishedCallback?: (call1: Call, call2: Call) => void,
    video?: boolean
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an incoming call to a user of the current application in the P2P mode. Dialed number is considered as username. Due to the P2P mode, media player and recording do not work. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param onEstablishedCallback Optional. Function that is invoked after call is established. Both calls (incoming and outgoing) are passed to this function
   */
  function forwardCallToUserDirect(
    onEstablishedCallback?: (call1: Call, call2: Call) => void
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to forward an incoming call to a user of the current application. Dialed number is considered as username. For more details see the [GitHub repo](https://github.com/voximplant/easyprocess).
   * @param onEstablishedCallback Optional. Function that is invoked after call is established. Both calls (incoming and outgoing) are passed to this function
   * @param video Whether the call has video support. Please note that the price for audio-only and video calls is different!
   */
  function forwardCallToUser(
    onEstablishedCallback?: (call1: Call, call2: Call) => void,
    video?: boolean
  ): void;
}

declare namespace VoxEngine {
  /**
   * Helper function to play sound to incoming call. It terminates a call in three cases:
   * 1) playback is finished
   * 2) call failed
   * 3) call disconnected
   * @param fileURL URL of audio (mp3) file to play
   */
  function playSoundAndHangup(fileURL: string): void;
}

declare namespace VoxEngine {
  /**
   * Removes a handler for the specified [AppEvents] event.
   * @param event Event class (i.e., [AppEvents.Started])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  function removeEventListener<T extends keyof _AppEvents>(
    event: AppEvents | T,
    callback?: (event: _AppEvents[T]) => any
  ): void;
}

declare namespace VoxEngine {
  /**
   * Start sending media between mediaUnit1 and mediaUnit2. This method binds two audio/video streams.
   * @param mediaUnit1 First media unit
   * @param mediaUnit2 Second media unit
   */
  function sendMediaBetween(mediaUnit1: VoxMediaUnit, mediaUnit2: VoxMediaUnit): void;
}

/**
 * [SequencePlayer] parameters. Can be passed as arguments to the [VoxEngine.createSequencePlayer] method.
 */
declare interface SequencePlayerParameters {
  /**
   * Array of the segments.
   */
  segments: SequencePlayerSegment[];
}

declare namespace VoxEngine {
  /**
   * Stops sending media between mediaUnit1 and mediaUnit2.
   * @param mediaUnit1 First media unit
   * @param mediaUnit2 Second media unit
   */
  function stopMediaBetween(mediaUnit1: VoxMediaUnit, mediaUnit2: VoxMediaUnit): void;
}

declare namespace VoxEngine {
  /**
   * Terminates the current JavaScript session. All audio/video streams are disconnected and scenario execution stops. Note that after this function, only the [AppEvents.Terminating] and [AppEvents.Terminated] events are triggered.
   * 
   * Note: if you are using this method inside a code block (e.g., an "if" block), it does not stop the execution of the current block. Use `return;` after using this method to exit the current code block.
   */
  function terminate(): void;
}

declare namespace VoxEngine {}


declare namespace VoximplantAPI {
    interface APIError {
        /**
         * The error code
         */
        code: number;
        /**
         * The error description
         */
        msg: string;
    }
    interface AccountInfo {
        /**
         * The account's ID
         */
        accountId: number;
        /**
         * The account's name
         */
        accountName: string;
        /**
         * The account's email
         */
        accountEmail: string;
        /**
         * The account API key. Use password or api_key authentication to show the api_key
         */
        apiKey?: string;
        /**
         * The first name
         */
        accountFirstName?: string;
        /**
         * The last name
         */
        accountLastName?: string;
        /**
         * The UTC account created time in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created: Date;
        /**
         * The notification language code (2 symbols, ISO639-1). Examples: en, ru
         */
        languageCode?: string;
        /**
         * The account location (timezone). Examples: America/Los_Angeles, Etc/GMT-8, Etc/GMT+10
         */
        location?: string;
        /**
         * The min balance value to notify by email or SMS
         */
        minBalanceToNotify?: number;
        /**
         * Whether Voximplant notifications are required
         */
        accountNotifications?: boolean;
        /**
         * Whether Voximplant plan changing notifications are required
         */
        tariffChangingNotifications?: boolean;
        /**
         * Whether Voximplant news notifications are required
         */
        newsNotifications?: boolean;
        /**
         * The company or businessman name
         */
        billingAddressName?: string;
        /**
         * The billing address country code (2 symbols, ISO 3166-1 alpha-2). Examples: US, RU, GB
         */
        billingAddressCountryCode?: string;
        /**
         * The office address
         */
        billingAddressAddress?: string;
        /**
         * The office ZIP
         */
        billingAddressZip?: string;
        /**
         * The office phone number
         */
        billingAddressPhone?: string;
        /**
         * The office state (US) or province (Canada), up to 100 characters. Examples: California, Illinois, British Columbia
         */
        billingAddressState?: string;
        /**
         * Whether the account is ctive
         */
        active: boolean;
        /**
         * Whether account is blocked by Voximplant admins
         */
        frozen?: boolean;
        /**
         * The account's money
         */
        balance?: number;
        /**
         * The account's credit limit
         */
        creditLimit?: number;
        /**
         * The currency code (USD, RUR, EUR, ...)
         */
        currency?: string;
        /**
         * Whether Robokassa payments are allowed
         */
        supportRobokassa?: boolean;
        /**
         * Whether Bank card payments are allowed
         */
        supportBankCard?: boolean;
        /**
         * Whether Bank invoices are allowed
         */
        supportInvoice?: boolean;
        /**
         * The custom data
         */
        accountCustomData?: string;
        /**
         * The allowed access entries (the API function names)
         */
        accessEntries?: string[];
        /**
         * Whether the admin user permissions are granted
         */
        withAccessEntries?: boolean;
        /**
         * If URL is specified, Voximplant cloud makes HTTP POST requests to it when something happens. For a full list of reasons see the <b>type</b> field of the [AccountCallback] structure. The HTTP request has a JSON-encoded body that conforms to the [AccountCallbacks] structure
         */
        callbackUrl?: string;
        /**
         * If salt string is specified, each HTTP request made by the Voximplant cloud toward the <b>callback_url</b> has a <b>salt</b> field set to MD5 hash of account information and salt. That hash can be used be a developer to ensure that HTTP request is made by the Voximplant cloud
         */
        callbackSalt?: string;
        /**
         * Whether to send an email when a JS error occures
         */
        sendJsError?: boolean;
        /**
         * The payments limits applicable to each payment method
         */
        billingLimits?: BillingLimits;
        /**
         * Whether to activate one-way SMS
         */
        a2pSmsEnabled?: boolean;
    }
    interface BillingLimits {
        /**
         * The Robokassa limits
         */
        robokassa?: BillingLimitInfo;
        /**
         * The bank card limits
         */
        bankCard?: BankCardBillingLimitInfo;
        /**
         * The invoice limits
         */
        invoice?: BillingLimitInfo;
    }
    interface BillingLimitInfo {
        /**
         * The minimum amount
         */
        minAmount: number;
        /**
         * The currency
         */
        currency: string;
    }
    interface BankCardBillingLimitInfo {
        /**
         * The minimum amount
         */
        minAmount: number;
        /**
         * The currency
         */
        currency: string;
    }
    interface ApplicationInfo {
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The full application name
         */
        applicationName: string;
        /**
         * The application editing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified: Date;
        /**
         * Whether a secure storage for logs and records is enabled
         */
        secureRecordStorage: boolean;
    }
    interface UserInfo {
        /**
         * The user ID
         */
        userId: number;
        /**
         * The user name
         */
        userName: string;
        /**
         * The display user name
         */
        userDisplayName: string;
        /**
         * Whether the user is active. Inactive users cannot log in to applications
         */
        userActive: boolean;
        /**
         * Whether the user uses the parent account's money, 'false' if the user has a separate balance
         */
        parentAccounting: boolean;
        /**
         * The current user's money in the currency specified for the account. The value is the number rounded to 4 decimal places and it changes during the calls, transcribing, purchases etc
         */
        liveBalance: number;
        /**
         * The current user's money in the currency specified for the account. The value is the number rounded to 4 decimal places. The parameter is the alias to live_balance by default. But there is a possibility to make the alias to fixed_balance: just to pass return_live_balance=false into the [GetAccountInfo] method
         */
        balance: number;
        /**
         * The last committed balance which has been approved by billing's transaction
         */
        fixedBalance: number;
        /**
         * The custom data
         */
        userCustomData?: string;
        /**
         * The bound applications
         */
        applications?: ApplicationInfo[];
        /**
         * The bound skills
         */
        skills?: SkillInfo[];
        /**
         * The bound ACD queues
         */
        acdQueues?: ACDQueueOperatorInfo[];
        /**
         * The ACD operator status. The following values are possible: OFFLINE, ONLINE, READY, BANNED, IN_SERVICE, AFTER_SERVICE, TIMEOUT, DND
         */
        acdStatus?: string;
        /**
         * The ACD status changing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        acdStatusChangeTime: Date;
        /**
         * The user editing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created: Date;
        /**
         * The user editing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified: Date;
    }
    interface SipWhiteListInfo {
        /**
         * The SIP white list item ID
         */
        sipWhitelistId: number;
        /**
         * The network address in format A.B.C.D/L
         */
        sipWhitelistNetwork: string;
        /**
         * The network address description
         */
        description?: string;
    }
    interface CallSessionInfo {
        /**
         * The routing rule name
         */
        ruleName: string;
        /**
         * The application name
         */
        applicationName: string;
        /**
         * The unique JS session identifier
         */
        callSessionHistoryId: number;
        /**
         * The account ID that initiates the JS session
         */
        accountId: number;
        /**
         * The application ID that initiates the JS session
         */
        applicationId: number;
        /**
         * The user ID that initiates the JS session
         */
        userId: number;
        /**
         * The start date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        startDate: Date;
        /**
         * The entire JS session duration in seconds. The session can contain multiple calls
         */
        duration?: number;
        /**
         * The initiator IP address
         */
        initiatorAddress: string;
        /**
         * The media server IP address
         */
        mediaServerAddress: string;
        /**
         * The link to the session log. The log retention policy is 1 month, after that time this field clears. If you have issues accessing the log file, check if the application has "Secure storage of applications and logs" feature enabled. In this case, you need to <a href='/docs/guides/managementapi/secureobjects'>authorize</a>.
         */
        logFileUrl: string;
        /**
         * Finish reason. Possible values are __Normal termination__, __Insufficient funds__, __Internal error (billing timeout)__, __Terminated administratively__, __JS session error__, __Timeout__
         */
        finishReason?: string;
        /**
         * Calls within the JS session, including durations, cost, phone numbers and other information
         */
        calls?: CallInfo[];
        /**
         * Used resources
         */
        otherResourceUsage?: ResourceUsage[];
        /**
         * Bound records
         */
        records?: Record[];
        /**
         * Custom data
         */
        customData?: string;
    }
    interface CallInfo {
        /**
         * The call history ID
         */
        callId: number;
        /**
         * The start time in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        startTime: Date;
        /**
         * The call duration in seconds
         */
        duration?: number;
        /**
         * The local number on the platform side
         */
        localNumber: string;
        /**
         * The remote number on the client side
         */
        remoteNumber: string;
        /**
         * The type of the remote number, such as PSTN, mobile, user or sip address
         */
        remoteNumberType: string;
        /**
         * Whether the call is incoming
         */
        incoming: boolean;
        /**
         * Whether the call is successful
         */
        successful: boolean;
        /**
         * The transaction ID
         */
        transactionId: number;
        /**
         * The record URL
         */
        recordUrl?: string;
        /**
         * The media server IP address
         */
        mediaServerAddress: string;
        /**
         * The call cost
         */
        cost?: number;
        /**
         * The custom data passed to the JS session
         */
        customData?: string;
    }
    interface TransactionInfo {
        /**
         * The transaction ID
         */
        transactionId: number;
        /**
         * The account ID
         */
        accountId: string;
        /**
         * The transaction date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        performedAt: Date;
        /**
         * The transaction amount, $
         */
        amount: number;
        /**
         * The amount currency (USD, RUR, EUR, ...).
         */
        currency: string;
        /**
         * The transaction type. The following values are possible: gift_revoke, resource_charge, money_distribution, subscription_charge, subscription_installation_charge, card_periodic_payment, card_overrun_payment, card_payment, rub_card_periodic_payment, rub_card_overrun_payment, rub_card_payment, robokassa_payment, gift, promo, adjustment, wire_transfer, us_wire_transfer, refund, discount, mgp_charge, mgp_startup, mgp_business, mgp_big_business, mgp_enterprise, mgp_large_enterprise, techsupport_charge, tax_charge, monthly_fee_charge, grace_credit_payment, grace_credit_provision, mau_charge, mau_overrun, im_charge, im_overrun, fmc_charge, sip_registration_charge, development_fee, money_transfer_to_child, money_transfer_to_parent, money_acceptance_from_child, money_acceptance_from_parent, phone_number_installation, phone_number_charge, toll_free_phone_number_installation, toll_free_phone_number_charge, services, user_money_transfer, paypal_payment, paypal_overrun_payment, paypal_periodic_payment
         */
        transactionType: string;
        /**
         * The transaction description
         */
        transactionDescription?: string;
    }
    interface ResourceUsage {
        /**
         * The resource usage ID
         */
        resourceUsageId: number;
        /**
         * The resource type. The possible values are CALLSESSION, VIDEOCALL, VIDEORECORD, VOICEMAILDETECTION, YANDEXASR, ASR, TRANSCRIPTION, TTS_TEXT_GOOGLE, TTS_YANDEX, AUDIOHDCONFERENCE
         */
        resourceType: string;
        /**
         * The resource cost
         */
        cost?: number;
        /**
         * The description
         */
        description?: string;
        /**
         * The start resource using time in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        usedAt: Date;
        /**
         * The transaction ID
         */
        transactionId: number;
        /**
         * The resource quantity
         */
        resourceQuantity?: number;
        /**
         * The resource unit
         */
        unit?: string;
        /**
         * The reference to call
         */
        refCallId?: number;
    }
    interface Record {
        /**
         * The record ID
         */
        recordId: number;
        /**
         * The record name
         */
        recordName?: string;
        /**
         * The record cost
         */
        cost?: number;
        /**
         * The start recording time in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        startTime: Date;
        /**
         * The call duration in seconds
         */
        duration?: number;
        /**
         * The record URL.  If you have issues accessing the record file, check if the application has "Secure storage of applications and logs" feature enabled. In this case, you need to <a href='/docs/guides/managementapi/secureobjects'>authorize</a>.
         */
        recordUrl?: string;
        /**
         * The transaction ID
         */
        transactionId: number;
        /**
         * The file size
         */
        fileSize?: number;
        /**
         * Transcription URL. To open the URL, please add authorization parameters and <b>record_id</b> to it
         */
        transcriptionUrl?: string;
        /**
         * The status of transcription. The possible values are Not required, In progress, Complete
         */
        transcriptionStatus?: string;
    }
    interface QueueInfo {
        /**
         * The ACD queue ID
         */
        acdQueueId: number;
        /**
         * The queue name
         */
        acdQueueName: string;
        /**
         * The application ID
         */
        applicationId?: number;
        /**
         * The integer queue priority. The highest priority is 0
         */
        acdQueuePriority: number;
        /**
         * The value in the range of [0.5 ... 1.0]. The value 1.0 means the service probability 100% in challenge with a lower priority queue
         */
        serviceProbability: number;
        /**
         * Whether to enable the auto binding of operators to a queue by skills comparing
         */
        autoBinding: boolean;
        /**
         * The maximum predicted waiting time in minutes. When a call is going to be enqueued to the queue, its predicted waiting time should be less or equal to the maximum predicted waiting time; otherwise, a call would be rejected
         */
        maxWaitingTime?: number;
        /**
         * The maximum number of calls that can be enqueued into this queue
         */
        maxQueueSize?: number;
        /**
         * The average service time in seconds. Specify the parameter to correct or initialize the waiting time prediction
         */
        averageServiceTime?: number;
        /**
         * The ACD queue creating UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created: Date;
        /**
         * The ACD queue editing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified: Date;
        /**
         * The ACD queue deleting UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        deleted?: Date;
        /**
         * The queue users info
         */
        users?: QueueUsers[];
        /**
         * The queue skills info
         */
        skills?: QueueSkills[];
        /**
         * The service level thresholds in seconds
         */
        slThresholds?: number[];
        /**
         * Number of agents bound to the queue
         */
        operatorcount?: number;
    }
    interface QueueSkills {
        /**
         * The skill ID
         */
        skillId: number;
        /**
         * The skill name
         */
        skillName: string;
    }
    interface QueueUsers {
        /**
         * The user ID
         */
        userId: number;
    }
    interface ACDState {
        /**
         * The queues' states
         */
        acdQueues: ACDQueueState[];
    }
    interface ACDQueueState {
        /**
         * The ACD queue ID
         */
        acdQueueId: number;
        /**
         * List of operators with the 'READY' state that can accept a call from this queue
         */
        readyOperators: ACDReadyOperatorState[];
        /**
         * Number of ready operators
         */
        readyOperatorsCount: number;
        /**
         * List of operators with the 'READY' state that cannot accept a call from this queue. Operator cannot accept a call if they are temporarily banned or they are servicing a call right now
         */
        lockedOperators: ACDLockedOperatorState[];
        /**
         * Number of locked operators
         */
        lockedOperatorsCount: number;
        /**
         * List of operators with the 'AFTER_SERVICE' state. This state is set right after a call is ended to indicate a call postprocessing
         */
        afterServiceOperators: ACDAfterServiceOperatorState[];
        /**
         * Number of operators with the 'AFTER SERVICE' state
         */
        afterServiceOperatorCount: number;
        /**
         * List of calls enqueued into this queue that are being serviced right now by operators
         */
        servicingCalls: ACDServicingCallState[];
        /**
         * List of calls enqueued into this queue that are not yet serviced by operators
         */
        waitingCalls: ACDWaitingCallState[];
    }
    interface ACDReadyOperatorState {
        /**
         * The user ID of the operator
         */
        userId: number;
        /**
         * The user name of the operator
         */
        userName: string;
        /**
         * The display user name of the operator
         */
        userDisplayName: string;
        /**
         * The idle duration in seconds. The minimum of the duration after the last hangup and the duration after the operator status changing to READY
         */
        idleDuration: number;
    }
    interface ACDLockedOperatorState {
        /**
         * The user ID of the operator
         */
        userId: number;
        /**
         * The user name of the operator
         */
        userName: string;
        /**
         * The display user name of the operator
         */
        userDisplayName: string;
        /**
         * The UTC time when the operator becomes unavailable in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        unreached?: Date;
        /**
         * The operator locks
         */
        locks?: ACDLock[];
        /**
         * The ACD operator calls
         */
        acdCalls?: ACDOperatorCall[];
        /**
         * The operator <a href='/docs/references/websdk/voximplant/operatoracdstatuses'>status string</a>. 'BANNED' string indicates temporarily <a href='/docs/guides/smartqueue/acdv1'>banned operators</a>. The following values are possible: READY, BANNED
         */
        status?: string;
    }
    interface ACDAfterServiceOperatorState {
        /**
         * The user ID of the operator
         */
        userId: number;
        /**
         * The user name of the operator
         */
        userName: string;
        /**
         * The display user name of the operator
         */
        userDisplayName: string;
        /**
         * The operator <a href='/docs/references/websdk/voximplant/operatoracdstatuses'>status string</a>
         */
        status?: string;
    }
    interface ACDLock {
        /**
         * The ACD lock ID
         */
        id: string;
        /**
         * The UTC lock created time in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created: Date;
    }
    interface ACDOperatorCall {
        /**
         * The ACD session history ID of the request
         */
        acdSessionHistoryId: number;
        /**
         * The internal ACD session history ID
         */
        acdRequestId: string;
        /**
         * The ACD queue ID
         */
        acdQueueId: number;
        /**
         * The ACD queue name
         */
        acdQueueName: string;
        /**
         * The client callerid
         */
        callerid?: string;
        /**
         * The begin time of the request in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        beginTime: Date;
        /**
         * The submission time of the request in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        submitted?: Date;
    }
    interface ACDServicingCallState {
        /**
         * The user ID of the operator
         */
        userId: number;
        /**
         * The user name of the operator
         */
        userName: string;
        /**
         * The display user name of the operator
         */
        userDisplayName: string;
        /**
         * The request priority
         */
        priority: number;
        /**
         * The client callerid
         */
        callerid?: string;
        /**
         * The begin time of the request in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        beginTime: Date;
        /**
         * The waiting time before servicing in seconds
         */
        waitingTime: number;
        /**
         * The ACD session history ID of the request
         */
        acdSessionHistoryId: number;
    }
    interface ACDWaitingCallState {
        /**
         * The user ID of the operator to try to service the request
         */
        userId?: number;
        /**
         * The user name of the operator
         */
        userName: string;
        /**
         * The display user name of the operator
         */
        userDisplayName: string;
        /**
         * The request priority
         */
        priority: number;
        /**
         * The client callerid
         */
        callerid?: string;
        /**
         * The begin time of the request in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        beginTime: Date;
        /**
         * The waiting time in seconds
         */
        waitingTime: number;
        /**
         * The predicted minutes left to start servicing
         */
        minutesToSubmit: number;
        /**
         * The ACD session history ID of the request
         */
        acdSessionHistoryId: number;
    }
    interface AttachedPhoneInfo {
        /**
         * The phone ID
         */
        phoneId: number;
        /**
         * The phone number
         */
        phoneNumber: string;
        /**
         * The phone monthly charge
         */
        phonePrice: number;
        /**
         * The phone country code (2 symbols)
         */
        phoneCountryCode: string;
        /**
         * The next renewal date in format: YYYY-MM-DD
         */
        phoneNextRenewal: Date;
        /**
         * The purchase date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        phonePurchaseDate: Date;
        /**
         * Whether the subscription is frozen
         */
        deactivated: boolean;
        /**
         * Whether the subscription is cancelled
         */
        canceled: boolean;
        /**
         * Whether to charge automatically
         */
        autoCharge: boolean;
        /**
         * The id of the bound application
         */
        applicationId?: number;
        /**
         * The name of the bound application
         */
        applicationName?: string;
        /**
         * The id of the bound rule
         */
        ruleId?: number;
        /**
         * The name of the bound rule
         */
        ruleName?: string;
        /**
         * The phone category name (MOBILE, GEOGRAPHIC, TOLLFREE, MOSCOW495)
         */
        categoryName: string;
        /**
         * Whether the verification is required for the account
         */
        requiredVerification?: boolean;
        /**
         * The account verification status. The following values are possible: REQUIRED, IN_PROGRESS, VERIFIED
         */
        verificationStatus?: string;
        /**
         * Unverified phone hold until the date in format: YYYY-MM-DD (if the account verification is required). The number is detached on that day automatically!
         */
        unverifiedHoldUntil?: Date;
        /**
         * Whether a not verified account can use the phone
         */
        canBeUsed: boolean;
        /**
         * Whether SMS is supported for this phone number. SMS needs to be explicitly enabled via the [ControlSms] Management API before sending or receiving SMS. If SMS is supported and enabled, SMS can be sent from this phone number via the [SendSmsMessage] Management API and received via the [InboundSmsCallback] property of the HTTP callback. See <a href='/docs/guides/managementapi/callbacks'>this article</a> for HTTP callback details
         */
        isSmsSupported: boolean;
        /**
         * Whether SMS sending and receiving is enabled for this phone number via the [ControlSms] Management API
         */
        isSmsEnabled: boolean;
        /**
         * If set, the callback of an incoming SMS is sent to this url, otherwise, it is sent to the general account URL
         */
        incomingSmsCallbackUrl?: string;
        /**
         * Whether you need to make a request to enable calls to emergency numbers
         */
        emergencyCallsToBeEnabled: boolean;
        /**
         * Whether calls to emergency numbers are enabled
         */
        emergencyCallsEnabled: boolean;
        /**
         * Phone number subscription ID
         */
        subscriptionId: number;
        /**
         * Full application name, e.g. myapp.myaccount.n1.voximplant.com
         */
        extendedApplicationName?: string;
        /**
         * Phone region name
         */
        phoneRegionName?: string;
        /**
         * UTC date of an event associated with the number in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified: Date;
    }
    interface CallerIDInfo {
        /**
         * The callerID id
         */
        calleridId: number;
        /**
         * The callerID number
         */
        calleridNumber: string;
        /**
         * Whether active
         */
        active: boolean;
        /**
         * The code entering attempts left for the unverified callerID
         */
        codeEnteringAttemptsLeft?: number;
        /**
         * The verification call attempts left for the unverified callerID
         */
        verificationCallAttemptsLeft?: number;
        /**
         * The verification ending date in format: YYYY-MM-DD (for the verified callerID)
         */
        verifiedUntil?: Date;
    }
    interface OutboundTestPhonenumberInfo {
        /**
         * The personal phone number
         */
        phoneNumber: string;
        /**
         * Whether the phone number is verified
         */
        isVerified: boolean;
        /**
         * The country code
         */
        countryCode: string;
    }
    interface ACDQueueOperatorInfo {
        /**
         * The ACD queue ID
         */
        acdQueueId: number;
        /**
         * The ACD queue name
         */
        acdQueueName: string;
        /**
         * Whether the user is bound to the ACD queue in manual mode if false
         */
        autoLink: boolean;
    }
    interface SkillInfo {
        /**
         * The skill ID
         */
        skillId: number;
        /**
         * The skill name
         */
        skillName: string;
    }
    interface ExchangeRates {
        /**
         * The RUR exchange rate
         */
        RUR?: number;
        /**
         * The KZT exchange rate
         */
        KZT?: number;
        /**
         * The EUR exchange rate
         */
        EUR?: number;
        /**
         * The USD exchange rate. It is always equal to 1
         */
        USD?: number;
    }
    interface CallList {
        /**
         * The list ID
         */
        listId: number;
        /**
         * The list name
         */
        listName: string;
        /**
         * The priority of the call list
         */
        priority: number;
        /**
         * The rule id
         */
        ruleId: number;
        /**
         * The maximum number of simultaneous tasks
         */
        maxSimultaneous: number;
        /**
         * The number of task attempts run, which failed to call
         */
        numAttempts: number;
        /**
         * The date of submitted the list in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        dtSubmit: Date;
        /**
         * The completion date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        dtComplete?: Date;
        /**
         * The interval between attempts in seconds
         */
        intervalSeconds: number;
        /**
         * The status name. The possible values are __In progress__, __Completed__, __Canceled__
         */
        status: string;
    }
    interface SIPRegistration {
        /**
         * The SIP registration ID
         */
        sipRegistrationId: number;
        /**
         * The user name from sip proxy
         */
        sipUsername: string;
        /**
         * The sip proxy
         */
        proxy: string;
        /**
         * The last time updated
         */
        lastUpdated: number;
        /**
         * The SIP authentications user
         */
        authUser?: string;
        /**
         * The outgoing proxy
         */
        outboundProxy?: string;
        /**
         * Whether the SIP registration is successful
         */
        successful?: boolean;
        /**
         * The status code from a SIP registration
         */
        statusCode?: number;
        /**
         * The error message from a SIP registration
         */
        errorMessage?: string;
        /**
         * Whether the subscription is deactivation. The SIP registration is frozen if true
         */
        deactivated: boolean;
        /**
         * The next subscription renewal date in format: YYYY-MM-DD
         */
        nextSubscriptionRenewal: Date;
        /**
         * The purchase date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        purchaseDate: Date;
        /**
         * The subscription monthly charge
         */
        subscriptionPrice: string;
        /**
         * Whether the SIP registration is persistent. Set false to activate it only on the user login
         */
        isPersistent: boolean;
        /**
         * The id of the bound user
         */
        userId?: number;
        /**
         * The name of the bound user
         */
        userName?: string;
        /**
         * The id of the bound application
         */
        applicationId?: number;
        /**
         * The name of the bound application
         */
        applicationName?: string;
        /**
         * The id of the bound rule
         */
        ruleId?: number;
        /**
         * The name of the bound rule
         */
        ruleName?: string;
    }
    interface AdminRole {
        /**
         * The admin role ID
         */
        adminRoleId: number;
        /**
         * The admin role name
         */
        adminRoleName: string;
        /**
         * Whether to ignore the allowed and denied entries
         */
        adminRoleActive: boolean;
        /**
         * Whether it is a system role
         */
        systemRole: boolean;
        /**
         * The admin role editing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified: Date;
        /**
         * The allowed access entries (the API function names)
         */
        allowedEntries?: string[];
        /**
         * The denied access entries (the API function names)
         */
        deniedEntries?: string[];
    }
    interface AdminUser {
        /**
         * The admin user ID
         */
        adminUserId: number;
        /**
         * The admin user name
         */
        adminUserName: string;
        /**
         * The admin user display name
         */
        adminUserDisplayName: string;
        /**
         * Whether login is allowed
         */
        adminUserActive: boolean;
        /**
         * The admin user editing UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified: Date;
        /**
         * The allowed access entries (the API function names)
         */
        accessEntries?: string[];
        /**
         * The attached admin roles
         */
        adminRoles?: AdminRole[];
    }
    interface AuthorizedAccountIP {
        /**
         * The authorized IP4 or network
         */
        authorizedIp: string;
        /**
         * Whether the IP is allowed (true - whitelist, false - blacklist)
         */
        allowed: boolean;
        /**
         * The item creating UTC date in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created: Date;
    }
    interface PstnBlackListInfo {
        /**
         * The black list item ID
         */
        pstnBlacklistId: number;
        /**
         * The phone number
         */
        pstnBlacklistPhone: string;
    }
    interface RecordStorageInfo {
        /**
         * The record storage ID
         */
        recordStorageId?: number;
        /**
         * The record storage name
         */
        recordStorageName?: string;
    }
    interface SmsTransaction {
        /**
         * Message ID
         */
        messageId: number;
        /**
         * The SMS destination number
         */
        destinationNumber: string;
    }
    interface FailedSms {
        /**
         * The SMS destination number
         */
        destinationNumber: string;
        /**
         * The error description
         */
        errorDescription: string;
        /**
         * The error code
         */
        errorCode: number;
    }
    interface RoleGroupView {
        /**
         * The role group ID
         */
        id: number;
        /**
         * The role group name
         */
        name: string;
    }
    interface SmsHistory {
        /**
         * Message ID
         */
        messageId: number;
        /**
         * Number being called from
         */
        sourceNumber: number;
        /**
         * Number being called to
         */
        destinationNumber: number;
        /**
         * Incoming or outgoing message
         */
        direction: string;
        /**
         * Number of fragments the initial message is divided into
         */
        fragments: number;
        /**
         * Cost of the message
         */
        cost: number;
        /**
         * Status of the message. 1 - Success, 2 - Error
         */
        statusId: string;
        /**
         * Error message (if any)
         */
        errorMessage?: string;
        /**
         * Date of message processing. The format is yyyy-MM-dd HH:mm:ss
         */
        processedDate: Date;
        /**
         * Id of the transaction for this message
         */
        transactionId?: number;
        /**
         * Stored message text
         */
        text?: string;
    }
    interface A2PSmsHistory {
        /**
         * Message ID
         */
        messageId: number;
        /**
         * SMS source number
         */
        sourceNumber: number;
        /**
         * SMS destination number
         */
        destinationNumber: number;
        /**
         * Number of fragments the initial message is divided into
         */
        fragments: number;
        /**
         * The message cost
         */
        cost: number;
        /**
         * The message status. 1 - Success, 2 - Error
         */
        statusId: string;
        /**
         * Error message (if any)
         */
        errorMessage?: string;
        /**
         * Date of message processing. The format is yyyy-MM-dd HH:mm:ss
         */
        processingDate: Date;
        /**
         * The transaction ID for this message
         */
        transactionId: number;
        /**
         * Delivery status: QUEUED, DISPATCHED, ABORTED, REJECTED, DELIVERED, FAILED, EXPIRED, UNKNOWN
         */
        deliveryStatus: string;
        /**
         * Stored message text
         */
        text?: string;
    }
    interface GetSQQueuesResult {
        /**
         * ID of the SmartQueue
         */
        sqQueueId: number;
        /**
         * Name of the SmartQueue
         */
        sqQueueName: string;
        /**
         * Agent selection strategy
         */
        agentSelection: string;
        /**
         * Strategy of prioritizing requests for service
         */
        taskSelection: string;
        /**
         * Comment
         */
        description?: string;
        /**
         * UTC date of the queue creation in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created?: Date;
        /**
         * UTC date of the queue modification in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified?: Date;
        /**
         * Maximum time in minutes that a CALL-type request can remain in the queue without being assigned to an agent
         */
        callMaxWaitingTime?: number;
        /**
         * Maximum time in minutes that an IM-type request can remain in the queue without being assigned to an agent
         */
        imMaxWaitingTime?: number;
        /**
         * Maximum size of the queue with CALL-type requests
         */
        callMaxQueueSize?: number;
        /**
         * Maximum size of the queue with IM-type requests
         */
        imMaxQueueSize?: number;
        /**
         * Number of agents bound to the queue
         */
        agentcount?: number;
    }
    interface GetSQSkillsResult {
        /**
         * ID of the skill
         */
        sqSkillId: number;
        /**
         * Name of the skill
         */
        sqSkillName: string;
        /**
         * Comment
         */
        description?: string;
        /**
         * UTC date of the queue creation in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        created?: Date;
        /**
         * UTC date of the queue modification in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        modified?: Date;
    }
    interface GetSQAgentsResult {
        /**
         * ID of the user
         */
        userId?: number;
        /**
         * Name of the user
         */
        userName?: string;
        /**
         * Display name of the user
         */
        userDisplayName?: string;
        /**
         * Maximum number of chats that the user processes simultaneously
         */
        maxSimultaneousConversations?: number;
        /**
         * Agent statuses info
         */
        sqStatuses?: SmartQueueStateAgentStatus[];
        /**
         * JSON array of the agent's queues
         */
        sqQueues?: any;
        /**
         * JSON array of the agent's skills
         */
        sqSkills?: any;
    }
    interface SmartQueueMetricsResult {
        /**
         * The report type(s). Possible values are calls_blocked_percentage, count_blocked_calls, average_abandonment_rate, count_abandonment_calls, service_level, occupancy_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_banned_time, min_time_in_queue,max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime, sum_agents_custom_1_time ... sum_agents_custom_10_time
         */
        reportType: string;
        /**
         * Grouping by agent or queue
         */
        groups: SmartQueueMetricsGroups[];
    }
    interface SmartQueueMetricsGroups {
        /**
         * The SmartQueue ID
         */
        sqQueueId?: number;
        /**
         * The SmartQueue name
         */
        sqQueueName?: string;
        /**
         * The user ID
         */
        userId?: number;
        /**
         * The user name
         */
        userName?: string;
        /**
         * The user display name
         */
        userDisplayName?: string;
        /**
         * The group values
         */
        values: SmartQueueMetricsGroupsValues[];
    }
    interface SmartQueueMetricsGroupsValues {
        /**
         * The start of the period
         */
        fromDate: Date;
        /**
         * The end of the period
         */
        toDate: Date;
        /**
         * The report value
         */
        value: number;
    }
    interface SmartQueueState {
        /**
         * The SmartQueue ID
         */
        sqQueueId: number;
        /**
         * The SmartQueue name
         */
        sqQueueName: string;
        /**
         * The list of logged-in agents with their skills and statuses
         */
        sqAgents: SmartQueueStateAgent[];
        /**
         * The list of tasks
         */
        tasks: SmartQueueStateTask[];
    }
    interface SmartQueueStateTask {
        /**
         * The task type. Possible values are CALL, IM
         */
        taskType: string;
        /**
         * The task status. Possible values are IN_QUEUE, DISTRIBUTED, IN_PROCESSING
         */
        status: string;
        /**
         * Selected agent
         */
        userId?: number;
        /**
         * Task skills
         */
        sqSkills: SmartQueueTaskSkill[];
        /**
         * Waiting time in ms
         */
        waitingTime: number;
        /**
         * Processing time in ms
         */
        processingTime: number;
        /**
         * Custom data text string for the current task. You can set the custom data in the [enqueueTask](/docs/references/voxengine/voxengine/enqueuetask#enqueuetask) method
         */
        customData?: any;
    }
    interface SmartQueueStateAgent {
        /**
         * The user ID
         */
        userId: number;
        /**
         * The user name
         */
        userName: string;
        /**
         * The display user name
         */
        userDisplayName: string;
        /**
         * Agent skills
         */
        sqSkills: SmartQueueAgentSkill[];
        /**
         * Agent statuses info
         */
        sqStatuses: SmartQueueStateAgentStatus[];
    }
    interface SmartQueueAgentSkill {
        /**
         * The agent skill ID
         */
        sqSkillId: number;
        /**
         * The agent skill name
         */
        sqSkillName: string;
        /**
         * The agent skill level
         */
        sqSkillLevel: number;
    }
    interface SmartQueueTaskSkill {
        /**
         * The skill name
         */
        sqSkillName: string;
        /**
         * The skill level
         */
        sqSkillLevel: number;
    }
    interface SmartQueueStateAgentStatus {
        /**
         * The IM status info
         */
        IM: SmartQueueStateAgentStatus_;
        /**
         * The CALL status info
         */
        CALL: SmartQueueStateAgentStatus_;
    }
    interface SmartQueueStateAgentStatus_ {
        /**
         * The status name
         */
        sqStatusName: string;
        /**
         * Time in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        fromDate: Date;
    }
    interface KeyValueItems {
        /**
         * Key that matches the specified key or key pattern
         */
        key: string;
        /**
         * Value for the specified key
         */
        value: string;
        /**
         * Expiration date based on **ttl** (timestamp without milliseconds)
         */
        expiresAt: number;
    }
    interface KeyValueKeys {
        /**
         * Key that matches the pattern
         */
        key: string;
        /**
         * Expiration date based on **ttl** (timestamp without milliseconds)
         */
        expiresAt: number;
    }
    interface AccountInvoice {
        /**
         * Invoice period
         */
        period: InvoicePeriod;
        /**
         * Info on all money spent in the invoice
         */
        amount: InvoiceTotalDetails;
        /**
         * Invoice id
         */
        invoiceId: number;
        /**
         * Detailed info on each spending
         */
        rows: InvoiceSpendingDetails;
        /**
         * Unique invoice number
         */
        invoiceNumber: string;
        /**
         * Date when the invoice is created in format: YYYY-MM-DD
         */
        invoiceDate: Date;
        /**
         * Invoice status
         */
        status: string;
    }
    interface InvoicePeriod {
        /**
         * From date in format: YYYY-MM-DD
         */
        from: Date;
        /**
         * To date in format: YYYY-MM-DD
         */
        to: Date;
    }
    interface InvoiceTotalDetails {
        /**
         * Total amount of taxes
         */
        taxAmount: number;
        /**
         * Invoice total amount including taxes
         */
        totalAmount: number;
        /**
         * Discounted amount to pay
         */
        amountToPay: number;
        /**
         * Discount
         */
        discountAmount: number;
        /**
         * Invoice currency
         */
        currency: string;
    }
    interface InvoiceSpendingDetails {
        /**
         * Paid amount
         */
        amount: InvoiceTotalDetails;
        /**
         * Service name
         */
        serviceName: string;
        /**
         * Array of taxes
         */
        taxes: InvoiceTaxesDetails;
    }
    interface InvoiceTaxesDetails {
        /**
         * Taxable sum
         */
        taxableMeasure: number;
        /**
         * Paid amount
         */
        amount: number;
        /**
         * Tax type. Possible values: Federal, State, County, City, Unincorporated
         */
        level: string;
        /**
         * Tax rate
         */
        rate: number;
        /**
         * Tax name
         */
        name: string;
        /**
         * Tax currency
         */
        currency: string;
        /**
         * Tax category
         */
        category: string;
    }
    interface GetAccountInfoRequest {
        /**
         * Whether to get the account's live balance
         */
        returnLiveBalance?: boolean;
    }
    interface GetAccountInfoResponse {
        /**
         * Account's info as the [AccountInfoType] object instance
         */
        result: AccountInfo;
        /**
         * The preferred address for the Management API requests
         */
        apiAddress: string;
        error?: APIError;
    }
    interface GetCurrencyRateRequest {
        /**
         * The currency code list separated by semicolons (;). Examples: RUR, KZT, EUR, USD
         */
        currency: string | string[];
        /**
         * The date, format: YYYY-MM-DD
         */
        date?: Date;
    }
    interface GetCurrencyRateResponse {
        /**
         * The exchange rates
         */
        result: ExchangeRates;
        error?: APIError;
    }
    interface AccountsInterface {
        /**
         * Gets the account's info such as account_id, account_name, account_email etc.
         */
        getAccountInfo: (request: GetAccountInfoRequest) => Promise<GetAccountInfoResponse>;
        /**
         * Gets the exchange rate on selected date (per USD).
         */
        getCurrencyRate: (request: GetCurrencyRateRequest) => Promise<GetCurrencyRateResponse>;
    }
    interface AddApplicationRequest {
        /**
         * The short application name in format \[a-z\]\[a-z0-9-\]{1,64}
         */
        applicationName: string;
        /**
         * Whether to enable secure storage for all logs and records of the application
         */
        secureRecordStorage?: boolean;
    }
    interface AddApplicationResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The full application name
         */
        applicationName: string;
        /**
         * Whether a secure storage for logs and records is enabled or not
         */
        secureRecordStorage: boolean;
        error?: APIError;
    }
    interface DelApplicationRequest {
        /**
         * The application ID list separated by semicolons (;). Use the 'all' value to select all applications
         */
        applicationId: 'any' | number | number[];
        /**
         * The application name list separated by semicolons (;). Can be used instead of <b>application_id</b>
         */
        applicationName: string | string[];
    }
    interface DelApplicationResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetApplicationInfoRequest {
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        requiredApplicationName: string;
        /**
         * The new short application name in format [a-z][a-z0-9-]{1,79}
         */
        applicationName?: string;
        /**
         * Whether to enable secure storage for all logs and records of the application
         */
        secureRecordStorage?: boolean;
    }
    interface SetApplicationInfoResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The new full application name
         */
        applicationName: string;
        /**
         * Whether a secure storage for logs and records is enabled or not
         */
        secureRecordStorage: boolean;
        error?: APIError;
    }
    interface GetApplicationsRequest {
        /**
         * The application ID to filter
         */
        applicationId?: number;
        /**
         * The application name part to filter
         */
        applicationName?: string;
        /**
         * Whether to get bound rules info
         */
        withRules?: boolean;
        /**
         * Whether to get bound rules and scenarios info
         */
        withScenarios?: boolean;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetApplicationsResponse {
        result: ApplicationInfo[];
        /**
         * The total found application count
         */
        totalCount: number;
        /**
         * The returned application count
         */
        count: number;
        error?: APIError;
    }
    interface ApplicationsInterface {
        /**
         * Adds a new account's application.
         */
        addApplication: (request: AddApplicationRequest) => Promise<AddApplicationResponse>;
        /**
         * Deletes the account's application.
         */
        delApplication: (request: DelApplicationRequest) => Promise<DelApplicationResponse>;
        /**
         * Edits the account's application.
         */
        setApplicationInfo: (request: SetApplicationInfoRequest) => Promise<SetApplicationInfoResponse>;
        /**
         * Gets the account's applications.
         */
        getApplications: (request: GetApplicationsRequest) => Promise<GetApplicationsResponse>;
    }
    interface AddUserRequest {
        /**
         * The user name in format [a-z0-9][a-z0-9_-]{2,49}
         */
        userName: string;
        /**
         * The user display name. The length must be less than 256
         */
        userDisplayName: string;
        /**
         * The user password. Must be at least 8 characters long and contain at least one uppercase and lowercase letter, one number, and one special character
         */
        userPassword: string;
        /**
         * The application ID which a new user is to be bound to. Can be used instead of the <b>application_name</b> parameter
         */
        applicationId: number;
        /**
         * The application name which a new user is to be bound to. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName: string;
        /**
         * Whether the user uses the parent account's money, 'false' if the user has a separate balance
         */
        parentAccounting?: boolean;
        mobilePhone?: string;
        /**
         * Whether the user is active. Inactive users cannot log in to applications
         */
        userActive?: boolean;
        /**
         * Any string
         */
        userCustomData?: string;
    }
    interface AddUserResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The new user ID
         */
        userId: number;
        error?: APIError;
    }
    interface DelUserRequest {
        /**
         * The user ID list separated by semicolons (;). Use the 'all' value to select all users
         */
        userId: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;) that can be used instead of <b>user_id</b>
         */
        userName: string | string[];
        /**
         * Delete the specified users bound to the application ID. It is required if the <b>user_name</b> is specified
         */
        applicationId?: number;
        /**
         * Delete the specified users bound to the application name. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName?: string;
    }
    interface DelUserResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetUserInfoRequest {
        /**
         * The user to edit
         */
        userId: number;
        /**
         * The user name that can be used instead of <b>user_id</b>
         */
        userName: string;
        /**
         * The application ID. It is required if the <b>user_name</b> is specified
         */
        applicationId?: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * The new user name in format [a-z0-9][a-z0-9_-]{2,49}
         */
        newUserName?: string;
        /**
         * The new user display name. The length must be less than 256
         */
        userDisplayName?: string;
        /**
         * The new user password. Must be at least 8 characters long and contain at least one uppercase and lowercase letter, one number, and one special character
         */
        userPassword?: string;
        /**
         * Whether to use the parent account's money, 'false' to use a separate user balance
         */
        parentAccounting?: boolean;
        /**
         * Whether the user is active. Inactive users cannot log in to applications
         */
        userActive?: boolean;
        /**
         * Any string
         */
        userCustomData?: string;
        mobilePhone?: string;
    }
    interface SetUserInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetUsersRequest {
        /**
         * The application ID to filter
         */
        applicationId: number;
        /**
         * The application name part to filter
         */
        applicationName: string;
        /**
         * The skill ID to filter
         */
        skillId?: number;
        /**
         * The excluded skill ID to filter
         */
        excludedSkillId?: number;
        /**
         * The ACD queue ID to filter
         */
        acdQueueId?: number;
        /**
         * The excluded ACD queue ID to filter
         */
        excludedAcdQueueId?: number;
        /**
         * The user ID to filter
         */
        userId?: number;
        /**
         * The user name part to filter
         */
        userName?: string;
        /**
         * Whether the user is active to filter. Inactive users cannot log in to applications
         */
        userActive?: boolean;
        /**
         * The user display name part to filter
         */
        userDisplayName?: string;
        /**
         * Whether to get the bound skills
         */
        withSkills?: boolean;
        /**
         * Whether to get the bound queues
         */
        withQueues?: boolean;
        /**
         * The ACD status list separated by semicolons (;) to filter. The following values are possible: OFFLINE, ONLINE, READY, BANNED, IN_SERVICE, AFTER_SERVICE, TIMEOUT, DND
         */
        acdStatus?: string | string[];
        /**
         * The skill to show in the 'skills' field output
         */
        showingSkillId?: number;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        /**
         * The following values are available: 'user_id', 'user_name' and 'user_display_name'
         */
        orderBy?: string;
        /**
         * Whether to get the user live balance
         */
        returnLiveBalance?: boolean;
    }
    interface GetUsersResponse {
        /**
         * The UserInfoType records
         */
        result: UserInfo[];
        /**
         * The total found user count
         */
        totalCount: number;
        /**
         * The returned user count
         */
        count: number;
        error?: APIError;
    }
    interface TransferMoneyToUserRequest {
        /**
         * The user ID list separated by semicolons (;). Use the 'all' value to select all users
         */
        userId: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;) that can be used instead of <b>user_id</b>
         */
        userName: string | string[];
        /**
         * The money amount, $. The absolute amount value must be equal or greater than 0.01
         */
        amount: number;
        /**
         * The application ID. It is required if the <b>user_name</b> is specified
         */
        applicationId?: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * The amount currency. Examples: RUR, EUR, USD
         */
        currency?: string;
        /**
         * Whether to enable the strict mode. Returns error if strict_mode is true and a user or the account does not have enough money
         */
        strictMode?: boolean;
        /**
         * The user transaction description
         */
        userTransactionDescription?: string;
        /**
         * The account transaction description. The following macro available: ${user_id}, ${user_name}
         */
        accountTransactionDescription?: string;
    }
    interface TransferMoneyToUserResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The new account balance
         */
        balance: number;
        error?: APIError;
    }
    interface UsersInterface {
        /**
         * Adds a new user.
         */
        addUser: (request: AddUserRequest) => Promise<AddUserResponse>;
        /**
         * Deletes the specified user(s).
         */
        delUser: (request: DelUserRequest) => Promise<DelUserResponse>;
        /**
         * Edits the user.
         */
        setUserInfo: (request: SetUserInfoRequest) => Promise<SetUserInfoResponse>;
        /**
         * Shows the users of the specified account.
         */
        getUsers: (request: GetUsersRequest) => Promise<GetUsersResponse>;
        /**
         * Transfer the account's money to the user or transfer the user's money to the account if the money amount is negative.
         */
        transferMoneyToUser: (request: TransferMoneyToUserRequest) => Promise<TransferMoneyToUserResponse>;
    }
    interface CreateCallListRequest {
        /**
         * The rule ID. It is specified in the <a href='//manage.voximplant.com/applications'>Applications</a> section of the Control Panel
         */
        ruleId: number;
        /**
         * Call list priority. The value is in the range of [0 ... 2^31] where zero is the highest priority
         */
        priority: number;
        /**
         * Number of simultaneously processed tasks
         */
        maxSimultaneous: number;
        /**
         * Number of attempts. Minimum is <b>1</b>, maximum is <b>5</b>
         */
        numAttempts: number;
        /**
         * File name, up to 255 characters and cannot contain the '/' and '\' symbols
         */
        name: string;
        /**
         * Send as "body" part of the HTTP request or as multiform. The sending "file_content" via URL is at its own risk because the network devices tend to drop HTTP requests with large headers
         */
        fileContent: Buffer;
        /**
         * Interval between call attempts in seconds. The default is 0
         */
        intervalSeconds?: number;
        /**
         * Encoding file. The default is UTF-8
         */
        encoding?: string;
        /**
         * Separator values. The default is ';'
         */
        delimiter?: string;
        /**
         * Escape character for parsing csv
         */
        escape?: string;
        /**
         * Specifies the IP from the geolocation of the call list subscribers. It allows selecting the nearest server for serving subscribers
         */
        referenceIp?: string;
        /**
         * Specifies the location of the server where the scenario needs to be executed. Has higher priority than `reference_ip`. Request [getServerLocations](https://api.voximplant.com/getServerLocations) for possible values
         */
        serverLocation?: string;
    }
    interface CreateCallListResponse {
        /**
         * true
         */
        result: boolean;
        /**
         * The number of stored records
         */
        count: number;
        /**
         * The list ID
         */
        listId: number;
        error?: APIError;
    }
    interface GetCallListsRequest {
        /**
         * The list ID to filter. Can be a list separated by semicolons (;). Use the 'all' value to select all lists
         */
        listId?: 'any' | number | number[];
        /**
         * Find call lists by name
         */
        name?: string;
        /**
         * Whether to find only active call lists
         */
        isActive?: boolean;
        /**
         * The UTC 'from' date filter in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        fromDate?: Date;
        /**
         * The UTC 'to' date filter in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        toDate?: Date;
        /**
         * The type of the call list. The possible values are AUTOMATIC and MANUAL
         */
        typeList?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        /**
         * The application ID to filter. Can be a list separated by semicolons (;). Use the 'all' value to select all applications
         */
        applicationId?: 'any' | number | number[];
    }
    interface GetCallListsResponse {
        /**
         * Array of lists
         */
        result: CallList[];
        /**
         * The returned call list count
         */
        count: number;
        /**
         * The total found call list count
         */
        totalCount: number;
        error?: APIError;
    }
    interface CallListsInterface {
        /**
         * Adds a new CSV file for call list processing and starts the specified rule immediately. To send a file, use the request body. To set the call time constraints, use the following options in a CSV file: <ul><li>**__start_execution_time** – when the call list processing starts every day, UTC+0 24-h format: HH:mm:ss</li><li>**__end_execution_time** – when the call list processing stops every day,  UTC+0 24-h format: HH:mm:ss</li><li>**__start_at** – when the call list processing starts, UNIX timestamp. If not specified, the processing starts immediately after a method call</li><li>**__task_uuid** – call list UUID. A string up to 40 characters, can contain latin letters, digits, hyphens (-) and colons (:). Unique within the call list</li></ul><br>This method accepts CSV files with custom delimiters, such a commas (,), semicolons (;) and other. To specify a delimiter, pass it to the <b>delimiter</b> parameter.<br/><b>IMPORTANT:</b> the account's balance should be equal or greater than 1 USD. If the balance is lower than 1 USD, the call list processing does not start, or it stops immediately if it is active.
         */
        createCallList: (request: CreateCallListRequest) => Promise<CreateCallListResponse>;
        /**
         * Get all call lists for the specified user.
         */
        getCallLists: (request: GetCallListsRequest) => Promise<GetCallListsResponse>;
    }
    interface StartConferenceRequest {
        /**
         * The conference name. The name length must be less than 50 symbols
         */
        conferenceName: string;
        /**
         * The rule ID that needs to be launched. Please note, the necessary scenario needs to be attached to the rule
         */
        ruleId: number;
        /**
         * The user ID. Run the scripts from the user if set
         */
        userId?: number;
        /**
         * The user name that can be used instead of <b>user_id</b>. Run the scripts from the user if set
         */
        userName?: string;
        /**
         * The application ID
         */
        applicationId?: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * The script custom data, that can be accessed in the scenario via the <a href='/docs/references/voxengine/voxengine/customdata'>VoxEngine.customData()</a> method. Use the application/x-www-form-urlencoded content type with UTF-8 encoding.
         */
        scriptCustomData?: string;
        /**
         * Specifies the IP from the geolocation of predicted subscribers. It allows selecting the nearest server for serving subscribers
         */
        referenceIp?: string;
        /**
         * Specifies the location of the server where the scenario needs to be executed. Has higher priority than `reference_ip`. Request [getServerLocations](https://api.voximplant.com/getServerLocations) for possible values
         */
        serverLocation?: string;
    }
    interface StartConferenceResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The URL to control a created media session. It can be used for arbitrary tasks such as stopping scenario or passing additional data to it. Making HTTP request on this URL results in the [AppEvents.HttpRequest](/docs/references/voxengine/appevents#httprequest) VoxEngine event being triggered for a scenario, with an HTTP request data passed to it
         */
        mediaSessionAccessUrl: string;
        /**
         * The URL to control a created media session. It can be used for arbitrary tasks such as stopping scenario or passing additional data to it. Making HTTPS request on this URL results in the [AppEvents.HttpRequest](/docs/references/voxengine/appevents#httprequest) VoxEngine event being triggered for a scenario, with an HTTP request data passed to it
         */
        mediaSessionAccessSecureUrl: string;
        /**
         * The call session history ID. To search a call session result, paste the ID to the <a href='/docs/references/httpapi/history#getcallhistory'>GetCallHistory</a> method's <b>call_session_history_id</b> parameter
         */
        callSessionHistoryId: number;
        error?: APIError;
    }
    interface ScenariosInterface {
        /**
         * Runs a session for video conferencing or joins the existing video conference session.<br/><br/>When you create a session by calling this method, a scenario runs on one of the servers dedicated to video conferencing. All further method calls with the same **conference_name** do not create a new video conference session but join the existing one.<br/><br/>Use the [StartScenarios] method for creating audio conferences.
         */
        startConference: (request: StartConferenceRequest) => Promise<StartConferenceResponse>;
    }
    interface GetCallHistoryRequest {
        /**
         * The from date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        fromDate: Date;
        /**
         * The to date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        toDate: Date;
        timezone?: string;
        /**
         * To get the call history for the specific sessions, pass the session IDs to this parameter separated by a semicolon (;). You can find the session ID in the <a href='/docs/references/voxengine/appevents#started'>AppEvents.Started</a> event's <b>sessionID</b> property in a scenario, or retrieve it from the <b>call_session_history_id</b> value returned from the <a href='https://voximplant.com/docs/references/httpapi/scenarios#reorderscenarios'>StartScenarios</a> or <a href='https://voximplant.com/docs/references/httpapi/scenarios#startconference'>StartConference</a> methods
         */
        callSessionHistoryId?: 'any' | number | number[];
        /**
         * To receive the call history for a specific application, pass the application ID to this parameter
         */
        applicationId?: number;
        /**
         * The application name, can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * To receive the call history for a specific users, pass the user ID list separated by semicolons (;). If it is specified, the output contains the calls from the listed users only
         */
        userId?: 'any' | number | number[];
        /**
         * To receive the call history for a specific routing rule, pass the rule name to this parameter. Applies only if you set application_id or application_name
         */
        ruleName?: string;
        /**
         * To receive a call history for a specific remote numbers, pass the number list separated by semicolons (;). A remote number is a number on the client side
         */
        remoteNumber?: string | string[];
        /**
         * To receive a call history for a specific local numbers, pass the number list separated by semicolons (;). A local number is a number on the platform side
         */
        localNumber?: string | string[];
        /**
         * To filter the call history by the custom_data passed to the call sessions, pass the custom data to this parameter
         */
        callSessionHistoryCustomData?: string;
        /**
         * Whether to receive a list of sessions with all calls within the sessions, including phone numbers, call cost and other information
         */
        withCalls?: boolean;
        /**
         * Whether to get the calls' records
         */
        withRecords?: boolean;
        /**
         * Whether to get other resources usage (see [ResourceUsageType])
         */
        withOtherResources?: boolean;
        /**
         * The child account ID list separated by semicolons (;)
         */
        childAccountId?: 'any' | number | number[];
        /**
         * Whether to get the children account calls only
         */
        childrenCallsOnly?: boolean;
        /**
         * Whether to get a CSV file with the column names if the output=csv
         */
        withHeader?: boolean;
        /**
         * Whether to get records in the descent order
         */
        descOrder?: boolean;
        /**
         * Whether to include the 'total_count' and increase performance
         */
        withTotalCount?: boolean;
        /**
         * The number of returning records. In the synchronous mode, the maximum value is 1000
         */
        count?: number;
        /**
         * The number of records to skip in the output with a maximum value of 10000
         */
        offset?: number;
        /**
         * The output format. The following values available: json, csv
         */
        output?: string;
        /**
         * Whether to get records in the asynchronous mode (for csv output only). <b>Use this mode to download large amounts of data</b>. See the [GetHistoryReports], [DownloadHistoryReport] functions for details
         */
        isAsync?: boolean;
    }
    interface GetCallHistoryResponse {
        /**
         * The CallSessionInfoType records in sync mode or 1 in async mode
         */
        result: CallSessionInfo[];
        /**
         * The total found call session count (sync mode)
         */
        totalCount: number;
        /**
         * The returned call session count (sync mode)
         */
        count: number;
        /**
         * The used timezone
         */
        timezone: string;
        /**
         * The history report ID (async mode)
         */
        historyReportId: number;
        error?: APIError;
    }
    interface GetBriefCallHistoryRequest {
        /**
         * The from date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        fromDate: Date;
        /**
         * The to date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        toDate: Date;
        /**
         * The output format. The following values available: csv
         */
        output: string;
        /**
         * Whether to get records in the asynchronous mode. <b>Use this mode to download large amounts of data</b>. See the [GetHistoryReports], [DownloadHistoryReport] functions for details
         */
        isAsync: boolean;
        timezone?: string;
        /**
         * To get the call history for the specific sessions, pass the session IDs to this parameter separated by a semicolon (;). You can find the session ID in the <a href='/docs/references/voxengine/appevents#started'>AppEvents.Started</a> event's <b>sessionID</b> property in a scenario, or retrieve it from the <b>call_session_history_id</b> value returned from the <a href='https://voximplant.com/docs/references/httpapi/scenarios#reorderscenarios'>StartScenarios</a> or <a href='https://voximplant.com/docs/references/httpapi/scenarios#startconference'>StartConference</a> methods
         */
        callSessionHistoryId?: 'any' | number | number[];
        /**
         * To receive the call history for a specific application, pass the application ID to this parameter
         */
        applicationId?: number;
        /**
         * The application name, can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * To receive the call history for a specific routing rule, pass the rule name to this parameter. Applies only if you set application_id or application_name
         */
        ruleName?: string;
        /**
         * To receive a call history for a specific remote numbers, pass the number list separated by semicolons (;). A remote number is a number on the client side
         */
        remoteNumber?: string | string[];
        /**
         * To receive a call history for a specific local numbers, pass the number list separated by semicolons (;). A local number is a number on the platform side
         */
        localNumber?: string | string[];
        /**
         * To filter the call history by the custom_data passed to the call sessions, pass the custom data to this parameter
         */
        callSessionHistoryCustomData?: string;
        /**
         * Whether to get a CSV file with the column names if the output=csv
         */
        withHeader?: boolean;
        /**
         * Whether to get records in the descent order
         */
        descOrder?: boolean;
    }
    interface GetBriefCallHistoryResponse {
        /**
         * In the async mode, the value is always 1
         */
        result: number;
        /**
         * The history report ID
         */
        historyReportId: number;
        error?: APIError;
    }
    interface GetTransactionHistoryRequest {
        /**
         * The from date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        fromDate: Date;
        /**
         * The to date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        toDate: Date;
        timezone?: string;
        /**
         * The transaction ID list separated by semicolons (;)
         */
        transactionId?: 'any' | number | number[];
        paymentReference?: string;
        /**
         * The transaction type list separated by semicolons (;). The following values are possible: gift_revoke, resource_charge, money_distribution, subscription_charge, subscription_installation_charge, card_periodic_payment, card_overrun_payment, card_payment, rub_card_periodic_payment, rub_card_overrun_payment, rub_card_payment, robokassa_payment, gift, promo, adjustment, wire_transfer, us_wire_transfer, refund, discount, mgp_charge, mgp_startup, mgp_business, mgp_big_business, mgp_enterprise, mgp_large_enterprise, techsupport_charge, tax_charge, monthly_fee_charge, grace_credit_payment, grace_credit_provision, mau_charge, mau_overrun, im_charge, im_overrun, fmc_charge, sip_registration_charge, development_fee, money_transfer_to_child, money_transfer_to_parent, money_acceptance_from_child, money_acceptance_from_parent, phone_number_installation, phone_number_charge, toll_free_phone_number_installation, toll_free_phone_number_charge, services, user_money_transfer, paypal_payment, paypal_overrun_payment, paypal_periodic_payment
         */
        transactionType?: string | string[];
        /**
         * The user ID list separated by semicolons (;)
         */
        userId?: 'any' | number | number[];
        /**
         * The child account ID list separated by semicolons (;). Use the 'all' value to select all child accounts
         */
        childAccountId?: 'any' | number | number[];
        /**
         * Whether to get the children account transactions only
         */
        childrenTransactionsOnly?: boolean;
        /**
         * Whether to get the users' transactions only
         */
        usersTransactionsOnly?: boolean;
        /**
         * Whether to get records in the descent order
         */
        descOrder?: boolean;
        /**
         * The number of returning records. In the synchronous mode, the maximum value is 1000
         */
        count?: number;
        /**
         * The number of records to skip in the output with a maximum value of 10000
         */
        offset?: number;
        /**
         * The output format. The following values available: json, csv
         */
        output?: string;
        /**
         * Whether to get records in the asynchronous mode (for csv output only). <b>Use this mode to download large amounts of data</b>. See the [GetHistoryReports], [DownloadHistoryReport] functions for details
         */
        isAsync?: boolean;
        /**
         * Whether to get transactions on hold (transactions for which money is reserved but not yet withdrawn from the account)
         */
        isUncommitted?: boolean;
    }
    interface GetTransactionHistoryResponse {
        result: TransactionInfo[];
        /**
         * The total found transaction count
         */
        totalCount: number;
        /**
         * The used timezone. 'Etc/GMT' for example
         */
        timezone: string;
        /**
         * The returned transaction count
         */
        count: number;
        /**
         * The history report ID (async mode)
         */
        historyReportId: number;
        error?: APIError;
    }
    interface HistoryInterface {
        /**
         * Gets the account's call history, including call duration, cost, logs and other call information. You can filter the call history by a certain date
         */
        getCallHistory: (request: GetCallHistoryRequest) => Promise<GetCallHistoryResponse>;
        /**
         * Gets the account's brief call history. Use the [GetHistoryReports], [DownloadHistoryReport] methods to download the report.
         */
        getBriefCallHistory: (request: GetBriefCallHistoryRequest) => Promise<GetBriefCallHistoryResponse>;
        /**
         * Gets the transaction history.
         */
        getTransactionHistory: (request: GetTransactionHistoryRequest) => Promise<GetTransactionHistoryResponse>;
    }
    interface AddPstnBlackListItemRequest {
        /**
         * The phone number in format e164 or regex pattern
         */
        pstnBlacklistPhone: string;
    }
    interface AddPstnBlackListItemResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The PSTN black list item ID
         */
        pstnBlacklistId: number;
        error?: APIError;
    }
    interface SetPstnBlackListItemRequest {
        /**
         * The PSTN black list item ID
         */
        pstnBlacklistId: number;
        /**
         * The new phone number in format e164
         */
        pstnBlacklistPhone: string;
    }
    interface SetPstnBlackListItemResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface DelPstnBlackListItemRequest {
        /**
         * The PSTN black list item ID
         */
        pstnBlacklistId: number;
    }
    interface DelPstnBlackListItemResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetPstnBlackListRequest {
        /**
         * The PSTN black list item ID for filter
         */
        pstnBlacklistId?: number;
        /**
         * The phone number in format e164 for filter
         */
        pstnBlacklistPhone?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetPstnBlackListResponse {
        result: PstnBlackListInfo[];
        /**
         * The total found phone numbers count
         */
        totalCount: number;
        /**
         * The returned phone numbers count
         */
        count: number;
        error?: APIError;
    }
    interface PSTNBlacklistInterface {
        /**
         * Add a new phone number to the PSTN blacklist. Use blacklist to block incoming calls from specified phone numbers to numbers purchased from Voximplant. Since we have no control over exact phone number format for calls from SIP integrations, blacklisting such numbers should be done via JavaScript scenarios.
         */
        addPstnBlackListItem: (request: AddPstnBlackListItemRequest) => Promise<AddPstnBlackListItemResponse>;
        /**
         * Update the PSTN blacklist item. BlackList works for numbers that are purchased from Voximplant only. Since we have no control over exact phone number format for calls from SIP integrations, blacklisting such numbers should be done via JavaScript scenarios.
         */
        setPstnBlackListItem: (request: SetPstnBlackListItemRequest) => Promise<SetPstnBlackListItemResponse>;
        /**
         * Remove phone number from the PSTN blacklist.
         */
        delPstnBlackListItem: (request: DelPstnBlackListItemRequest) => Promise<DelPstnBlackListItemResponse>;
        /**
         * Get the whole PSTN blacklist.
         */
        getPstnBlackList: (request: GetPstnBlackListRequest) => Promise<GetPstnBlackListResponse>;
    }
    interface AddSipWhiteListItemRequest {
        /**
         * The network address in format A.B.C.D/L or A.B.C.D/a.b.c.d (example 192.168.1.5/16)
         */
        sipWhitelistNetwork: string;
        /**
         * The network address description
         */
        description?: string;
    }
    interface AddSipWhiteListItemResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The SIP white list item ID
         */
        sipWhitelistId: number;
        error?: APIError;
    }
    interface DelSipWhiteListItemRequest {
        /**
         * The SIP white list item ID to delete
         */
        sipWhitelistId: number;
    }
    interface DelSipWhiteListItemResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetSipWhiteListItemRequest {
        /**
         * The SIP white list item ID
         */
        sipWhitelistId: number;
        /**
         * The new network address in format A.B.C.D/L or A.B.C.D/a.b.c.d (example 192.168.1.5/16)
         */
        sipWhitelistNetwork: string;
        /**
         * The network address description
         */
        description?: string;
    }
    interface SetSipWhiteListItemResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetSipWhiteListRequest {
        /**
         * The SIP white list item ID to filter
         */
        sipWhitelistId?: number;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetSipWhiteListResponse {
        result: SipWhiteListInfo[];
        /**
         * The total found networks count
         */
        totalCount: number;
        /**
         * The returned networks count
         */
        count: number;
        error?: APIError;
    }
    interface SIPWhiteListInterface {
        /**
         * Adds a new network address to the SIP white list.
         */
        addSipWhiteListItem: (request: AddSipWhiteListItemRequest) => Promise<AddSipWhiteListItemResponse>;
        /**
         * Deletes the network address from the SIP white list.
         */
        delSipWhiteListItem: (request: DelSipWhiteListItemRequest) => Promise<DelSipWhiteListItemResponse>;
        /**
         * Edits the SIP white list.
         */
        setSipWhiteListItem: (request: SetSipWhiteListItemRequest) => Promise<SetSipWhiteListItemResponse>;
        /**
         * Gets the SIP white list.
         */
        getSipWhiteList: (request: GetSipWhiteListRequest) => Promise<GetSipWhiteListResponse>;
    }
    interface BindSipRegistrationRequest {
        /**
         * The registration ID
         */
        sipRegistrationId?: number;
        /**
         * The application ID which the SIP registration is to be bound to. Can be used instead of the <b>application_name</b> parameter
         */
        applicationId?: number;
        /**
         * The application name which the SIP registration is to be bound to. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName?: string;
        /**
         * The rule ID which the SIP registration is to be bound to. Can be used instead of the <b>rule_name</b> parameter
         */
        ruleId?: number;
        /**
         * The rule name which the SIP registration is to be bound to. Can be used instead of the <b>rule_id</b> parameter
         */
        ruleName?: string;
        /**
         * The user ID which the SIP registration is to be bound to. Can be used instead of the <b>user_name</b> parameter
         */
        userId?: number;
        /**
         * The user name which the SIP registration is to be bound to. Can be used instead of the <b>user_id</b> parameter
         */
        userName?: string;
        /**
         * Whether to bind or unbind (set true or false respectively)
         */
        bind?: boolean;
    }
    interface BindSipRegistrationResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetSipRegistrationsRequest {
        /**
         * The rule ID list separated by semicolons (;) to filter. Can be used instead of <b>rule_name</b>
         */
        ruleId: 'any' | number | number[];
        /**
         * The rule name list separated by semicolons (;) to filter. Can be used instead of <b>rule_id</b>
         */
        ruleName: string | string[];
        /**
         * The user ID list separated by semicolons (;) to filter. Can be used instead of <b>user_name</b>
         */
        userId: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;) to filter. Can be used instead of <b>user_id</b>
         */
        userName: string | string[];
        /**
         * The SIP registration ID
         */
        sipRegistrationId?: number;
        /**
         * The SIP user name to filter
         */
        sipUsername?: string;
        /**
         * Whether to show the frozen SIP registrations only
         */
        deactivated?: boolean;
        /**
         * Whether to show the successful SIP registrations only
         */
        successful?: boolean;
        /**
         * Whether the SIP registration is persistent to filter
         */
        isPersistent?: boolean;
        /**
         * The application ID list separated by semicolons (;) to filter. Can be used instead of <b>application_name</b>
         */
        applicationId?: 'any' | number | number[];
        /**
         * The application name list separated by semicolons (;) to filter. Can be used instead of <b>application_id</b>
         */
        applicationName?: string | string[];
        /**
         * Whether SIP registration bound to an application
         */
        isBoundToApplication?: boolean;
        /**
         * The list of proxy servers to use, divided by semicolon (;)
         */
        proxy?: string | string[];
        /**
         * Whether SIP registration is still in progress
         */
        inProgress?: boolean;
        /**
         * The list of SIP response codes. The __code1:code2__ means a range from __code1__ to __code2__ including; the __code1;code2__ meanse either __code1__ or __code2__. You can combine ranges, e.g., __code1;code2:code3__
         */
        statusCode?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetSipRegistrationsResponse {
        /**
         * Active SIP registrations
         */
        result: SIPRegistration[];
        /**
         * Count rows
         */
        count: number;
        error?: APIError;
    }
    interface SIPRegistrationInterface {
        /**
         * Bind the SIP registration to the application/user or unbind the SIP registration from the application/user. You should specify the application_id or application_name if you specify the rule_name or user_id, or user_name. You should specify the sip_registration_id if you set bind=true. You can bind only one SIP registration to the user (the previous SIP registration is automatically unbound).
         */
        bindSipRegistration: (request: BindSipRegistrationRequest) => Promise<BindSipRegistrationResponse>;
        /**
         * Get active SIP registrations.
         */
        getSipRegistrations: (request: GetSipRegistrationsRequest) => Promise<GetSipRegistrationsResponse>;
    }
    interface GetPhoneNumbersRequest {
        /**
         * The particular phone ID to filter
         */
        phoneId?: 'any' | number | number[];
        /**
         * The phone number list separated by semicolons (;) that can be used instead of <b>phone_id</b>
         */
        phoneNumber?: string | string[];
        /**
         * The application ID
         */
        applicationId?: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Whether the phone number bound to an application
         */
        isBoundToApplication?: boolean;
        /**
         * The phone number start to filter
         */
        phoneTemplate?: string;
        /**
         * The country code list separated by semicolons (;)
         */
        countryCode?: string | string[];
        /**
         * The phone category name. See the [GetPhoneNumberCategories] method
         */
        phoneCategoryName?: string;
        /**
         * Whether the subscription is cancelled to filter
         */
        canceled?: boolean;
        /**
         * Whether the subscription is frozen to filter
         */
        deactivated?: boolean;
        /**
         * Whether the auto_charge flag is enabled
         */
        autoCharge?: boolean;
        /**
         * The UTC 'from' date filter in format: YYYY-MM-DD
         */
        fromPhoneNextRenewal?: Date;
        /**
         * The UTC 'to' date filter in format: YYYY-MM-DD
         */
        toPhoneNextRenewal?: Date;
        /**
         * The UTC 'from' date filter in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        fromPhonePurchaseDate?: Date;
        /**
         * The UTC 'to' date filter in 24-h format: YYYY-MM-DD HH:mm:ss
         */
        toPhonePurchaseDate?: Date;
        /**
         * The child account ID list separated by semicolons (;). Use the 'all' value to select all child accounts
         */
        childAccountId?: 'any' | number | number[];
        /**
         * Whether to get the children phones only
         */
        childrenPhonesOnly?: boolean;
        /**
         * The required account verification name to filter
         */
        verificationName?: string;
        /**
         * The account verification status list separated by semicolons (;). The following values are possible: REQUIRED, IN_PROGRESS, VERIFIED
         */
        verificationStatus?: string | string[];
        /**
         * Unverified phone hold until the date (from ...) in format: YYYY-MM-DD
         */
        fromUnverifiedHoldUntil?: Date;
        /**
         * Unverified phone hold until the date (... to) in format: YYYY-MM-DD
         */
        toUnverifiedHoldUntil?: Date;
        /**
         * Whether a not verified account can use the phone
         */
        canBeUsed?: boolean;
        /**
         * The following values are available: 'phone_number' (ascent order), 'phone_price' (ascent order), 'phone_country_code' (ascent order), 'deactivated' (deactivated first, active last), 'purchase_date' (descent order), 'phone_next_renewal' (ascent order), 'verification_status', 'unverified_hold_until' (ascent order), 'verification_name'
         */
        orderBy?: string;
        /**
         * Flag allows you to display only the numbers of the sandbox, real numbers, or all numbers. The following values are possible: 'all', 'true', 'false'
         */
        sandbox?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        smsSupported?: boolean;
        /**
         * The region names list separated by semicolons (;)
         */
        phoneRegionName?: string | string[];
        /**
         * The rule ID list separated by semicolons (;)
         */
        ruleId?: 'any' | number | number[];
        /**
         * The rule names list separated by semicolons (;). Can be used only if __application_id__ or __application_name__ is specified
         */
        ruleName?: string | string[];
        /**
         * Whether the phone number is bound to some rule
         */
        isBoundToRule?: boolean;
    }
    interface GetPhoneNumbersResponse {
        /**
         * Phone numbers info
         */
        result: AttachedPhoneInfo[];
        /**
         * The total found phone count
         */
        totalCount: number;
        /**
         * The returned phone count
         */
        count: number;
        error?: APIError;
    }
    interface PhoneNumbersInterface {
        /**
         * Gets the account phone numbers.
         */
        getPhoneNumbers: (request: GetPhoneNumbersRequest) => Promise<GetPhoneNumbersResponse>;
    }
    interface AddCallerIDRequest {
        /**
         * The callerID number in E.164 format
         */
        calleridNumber: string;
    }
    interface AddCallerIDResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The id of the callerID object
         */
        calleridId: number;
        error?: APIError;
    }
    interface ActivateCallerIDRequest {
        /**
         * The id of the callerID object
         */
        calleridId: number;
        /**
         * The callerID number that can be used instead of <b>callerid_id</b>
         */
        calleridNumber: string;
        /**
         * The verification code, see the VerifyCallerID function
         */
        verificationCode: string;
    }
    interface ActivateCallerIDResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface DelCallerIDRequest {
        /**
         * The id of the callerID object
         */
        calleridId: number;
        /**
         * The callerID number that can be used instead of <b>callerid_id</b>
         */
        calleridNumber: string;
    }
    interface DelCallerIDResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetCallerIDsRequest {
        /**
         * The id of the callerID object to filter
         */
        calleridId?: number;
        /**
         * The phone number to filter
         */
        calleridNumber?: string;
        /**
         * Whether the account is active to filter
         */
        active?: boolean;
        /**
         * The following values are available: 'caller_number' (ascent order), 'verified_until' (ascent order)
         */
        orderBy?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetCallerIDsResponse {
        result: CallerIDInfo[];
        /**
         * The total found record count
         */
        totalCount: number;
        /**
         * The returned record count
         */
        count: number;
        error?: APIError;
    }
    interface VerifyCallerIDRequest {
        /**
         * The id of the callerID object
         */
        calleridId: number;
        /**
         * The callerID number that can be used instead of <b>callerid_id</b>
         */
        calleridNumber: string;
    }
    interface VerifyCallerIDResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface CallerIDsInterface {
        /**
         * Adds a new caller ID. Caller ID is the phone that is displayed to the called user. This number can be used for call back.
         */
        addCallerID: (request: AddCallerIDRequest) => Promise<AddCallerIDResponse>;
        /**
         * Activates the CallerID by the verification code.
         */
        activateCallerID: (request: ActivateCallerIDRequest) => Promise<ActivateCallerIDResponse>;
        /**
         * Deletes the CallerID. Note: you cannot delete a CID permanently (the antispam defence).
         */
        delCallerID: (request: DelCallerIDRequest) => Promise<DelCallerIDResponse>;
        /**
         * Gets the account callerIDs.
         */
        getCallerIDs: (request: GetCallerIDsRequest) => Promise<GetCallerIDsResponse>;
        /**
         * Gets a verification code via phone call to the **callerid_number**.
         */
        verifyCallerID: (request: VerifyCallerIDRequest) => Promise<VerifyCallerIDResponse>;
    }
    interface AddOutboundTestPhoneNumberRequest {
        /**
         * The personal phone number in the E.164 format
         */
        phoneNumber: string;
    }
    interface AddOutboundTestPhoneNumberResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface VerifyOutboundTestPhoneNumberRequest {
    }
    interface VerifyOutboundTestPhoneNumberResponse {
        /**
         * The number of attempts left for the day. The number is reset every day at 00:00 UTC
         */
        dailyAttemptsLeft: number;
        error?: APIError;
    }
    interface ActivateOutboundTestPhoneNumberRequest {
        /**
         * The verification code, see the [VerifyOutboundTestPhoneNumber] function
         */
        verificationCode: string;
    }
    interface ActivateOutboundTestPhoneNumberResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface DelOutboundTestPhoneNumberRequest {
    }
    interface DelOutboundTestPhoneNumberResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetOutboundTestPhoneNumbersRequest {
    }
    interface GetOutboundTestPhoneNumbersResponse {
        result: OutboundTestPhonenumberInfo[];
        error?: APIError;
    }
    interface OutboundTestNumbersInterface {
        /**
         * Adds a personal phone number to test outgoing calls. Only one personal phone number can be used. To replace it with another, delete the existing one first.
         */
        addOutboundTestPhoneNumber: (request: AddOutboundTestPhoneNumberRequest) => Promise<AddOutboundTestPhoneNumberResponse>;
        /**
         * Starts a call to the added phone number and pronounces a verification code. You have only 5 verification attempts per day and 100 in total. 1 minute should pass between 2 attempts.
         */
        verifyOutboundTestPhoneNumber: (request: VerifyOutboundTestPhoneNumberRequest) => Promise<VerifyOutboundTestPhoneNumberResponse>;
        /**
         * Activates the phone number by the verification code.
         */
        activateOutboundTestPhoneNumber: (request: ActivateOutboundTestPhoneNumberRequest) => Promise<ActivateOutboundTestPhoneNumberResponse>;
        /**
         * Deletes the existing phone number.
         */
        delOutboundTestPhoneNumber: (request: DelOutboundTestPhoneNumberRequest) => Promise<DelOutboundTestPhoneNumberResponse>;
        /**
         * Shows the phone number info.
         */
        getOutboundTestPhoneNumbers: (request: GetOutboundTestPhoneNumbersRequest) => Promise<GetOutboundTestPhoneNumbersResponse>;
    }
    interface AddQueueRequest {
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName: string;
        /**
         * The queue name. The length must be less than 100
         */
        acdQueueName: string;
        /**
         * The integer queue priority. The highest priority is 0
         */
        acdQueuePriority?: number;
        /**
         * Whether to enable the auto binding of operators to a queue by skills comparing
         */
        autoBinding?: boolean;
        /**
         * The value in the range of [0.5 ... 1.0]. The value 1.0 means the service probability 100% in challenge with a lower priority queue
         */
        serviceProbability?: number;
        /**
         * The max queue size
         */
        maxQueueSize?: number;
        /**
         * The max predicted waiting time in minutes. The client is rejected if the predicted waiting time is greater than the max predicted waiting time
         */
        maxWaitingTime?: number;
        /**
         * The average service time in seconds. Specify the parameter to correct or initialize the waiting time prediction
         */
        averageServiceTime?: number;
    }
    interface AddQueueResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The ACD queue ID
         */
        acdQueueId: number;
        error?: APIError;
    }
    interface BindUserToQueueRequest {
        /**
         * Whether to bind or unbind users
         */
        bind: boolean;
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName: string;
        /**
         * The user ID list separated by semicolons (;). Use the 'all' value to specify all users bound to the application
         */
        userId: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;). <b>user_name</b> can be used instead of <b>user_id</b>
         */
        userName: string | string[];
        /**
         * The ACD queue ID list separated by semicolons (;). Use the 'all' value to specify all queues bound to the application
         */
        acdQueueId: 'any' | number | number[];
        /**
         * The queue name that can be used instead of <b>acd_queue_id</b>. The queue name list separated by semicolons (;)
         */
        acdQueueName: string | string[];
    }
    interface BindUserToQueueResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface DelQueueRequest {
        /**
         * The ACD queue ID list separated by semicolons (;)
         */
        acdQueueId: 'any' | number | number[];
        /**
         * The ACD queue name that can be used instead of <b>acd_queue_id</b>. The ACD queue name list separated by semicolons (;)
         */
        acdQueueName: string | string[];
    }
    interface DelQueueResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetQueueInfoRequest {
        /**
         * The ACD queue ID
         */
        acdQueueId: number;
        /**
         * The ACD queue name that can be used instead of <b>acd_queue_id</b>
         */
        acdQueueName: string;
        /**
         * The new queue name. The length must be less than 100
         */
        newAcdQueueName?: string;
        /**
         * The integer queue priority. The highest priority is 0
         */
        acdQueuePriority?: number;
        /**
         * Whether to enable the auto binding of operators to a queue by skills comparing
         */
        autoBinding?: boolean;
        /**
         * The value in the range of [0.5 ... 1.0]. The value 1.0 means the service probability 100% in challenge with a lower priority queue
         */
        serviceProbability?: number;
        /**
         * The max queue size
         */
        maxQueueSize?: number;
        /**
         * The max predicted waiting time in minutes. The client is rejected if the predicted waiting time is greater than the max predicted waiting time
         */
        maxWaitingTime?: number;
        /**
         * The average service time in seconds. Specify the parameter to correct or initialize the waiting time prediction
         */
        averageServiceTime?: number;
        /**
         * The new application ID
         */
        applicationId?: number;
    }
    interface SetQueueInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetQueuesRequest {
        /**
         * The ACD queue ID to filter
         */
        acdQueueId?: number;
        /**
         * The ACD queue name part to filter
         */
        acdQueueName?: string;
        /**
         * The application ID to filter
         */
        applicationId?: number;
        /**
         * The skill ID to filter
         */
        skillId?: number;
        /**
         * The excluded skill ID to filter
         */
        excludedSkillId?: number;
        /**
         * Whether to get the bound skills
         */
        withSkills?: boolean;
        /**
         * The skill to show in the 'skills' field output
         */
        showingSkillId?: number;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        /**
         * Whether to include the number of agents bound to the queue
         */
        withOperatorcount?: boolean;
    }
    interface GetQueuesResponse {
        result: QueueInfo[];
        /**
         * The total found queue count
         */
        totalCount: number;
        /**
         * The returned queue count
         */
        count: number;
        error?: APIError;
    }
    interface GetACDStateRequest {
        /**
         * The ACD queue ID list separated by semicolons (;). Use the 'all' value to select all ACD queues
         */
        acdQueueId?: 'any' | number | number[];
    }
    interface GetACDStateResponse {
        result: ACDState;
        error?: APIError;
    }
    interface QueuesInterface {
        /**
         * Adds a new ACD queue.
         */
        addQueue: (request: AddQueueRequest) => Promise<AddQueueResponse>;
        /**
         * Bind/unbind users to/from the specified ACD queues. Note that users and queues should be already bound to the same application.
         */
        bindUserToQueue: (request: BindUserToQueueRequest) => Promise<BindUserToQueueResponse>;
        /**
         * Deletes the ACD queue.
         */
        delQueue: (request: DelQueueRequest) => Promise<DelQueueResponse>;
        /**
         * Edits the ACD queue.
         */
        setQueueInfo: (request: SetQueueInfoRequest) => Promise<SetQueueInfoResponse>;
        /**
         * Gets the ACD queues.
         */
        getQueues: (request: GetQueuesRequest) => Promise<GetQueuesResponse>;
        /**
         * Gets the current ACD queue state.
         */
        getACDState: (request: GetACDStateRequest) => Promise<GetACDStateResponse>;
    }
    interface GetSmartQueueRealtimeMetricsRequest {
        /**
         * The application ID to search by
         */
        applicationId: number;
        /**
         * The application name to search by. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName: string;
        /**
         * The report type. Possible values are: calls_blocked_percentage, count_blocked_calls, im_blocked_chats_percentage, im_count_blocked_chats, im_answered_chats_rate, average_abandonment_rate, count_abandonment_calls, service_level, im_service_level, occupancy_rate, im_agent_occupancy_rate, agent_utilization_rate, im_agent_utilization_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_in_service_incoming_time, sum_agents_in_service_outcoming_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_custom_1_time, sum_agents_custom_2_time, sum_agents_custom_3_time, sum_agents_custom_4_time, sum_agents_custom_5_time, sum_agents_custom_6_time, sum_agents_custom_7_time, sum_agents_custom_8_time, sum_agents_custom_9_time, sum_agents_custom_10_time, sum_agents_banned_time, im_sum_agents_online_time, im_sum_agents_ready_time, im_sum_agents_in_service_time, im_sum_agents_dnd_time, im_sum_agents_custom_1_time, im_sum_agents_custom_2_time, im_sum_agents_custom_3_time, im_sum_agents_custom_4_time, im_sum_agents_custom_5_time, im_sum_agents_custom_6_time, im_sum_agents_custom_7_time, im_sum_agents_custom_8_time, im_sum_agents_custom_9_time, im_sum_agents_custom_10_time, im_sum_agents_banned_time, average_agents_idle_time, max_agents_idle_time, min_agents_idle_time, percentile_0_25_agents_idle_time, percentile_0_50_agents_idle_time, percentile_0_75_agents_idle_time, min_time_in_queue, max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, im_min_answer_speed, im_max_answer_speed, im_average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime, count_agent_unanswered_calls, im_count_agent_unanswered_chats, min_reaction_time, max_reaction_time, average_reaction_time, im_min_reaction_time, im_max_reaction_time, im_average_reaction_time, im_count_abandonment_chats, im_count_lost_chats, im_lost_chats_rate
         */
        reportType: string | string[];
        /**
         * The user ID list with a maximum of 5 values separated by semicolons (;). Use the 'all' value to select all users. Can operate as a filter for the **occupancy_rate**, **sum_agents_online_time**, **sum_agents_ready_time**, **sum_agents_dialing_time**, **sum_agents_in_service_time**, **sum_agents_afterservice_time**, **sum_agents_dnd_time**, **sum_agents_banned_time**, **min_handle_time**, **max_handle_time**, **average_handle_time**, **count_handled_calls**, **min_after_call_worktime**, **max_after_call_worktime**, **average_after_call_worktime** report types
         */
        userId?: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;). <b>user_name</b> can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * The SmartQueue name list separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * The from date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss. Default is the current time minus 30 minutes
         */
        fromDate?: Date;
        /**
         * The to date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss. Default is the current time
         */
        toDate?: Date;
        /**
         * The selected timezone or the 'auto' value (the account location)
         */
        timezone?: string;
        /**
         * Interval format: YYYY-MM-DD HH:mm:ss. Default is 30 minutes
         */
        interval?: string;
        /**
         * Group the result by **agent** or *queue*. The **agent** grouping is allowed for 1 queue and for the occupancy_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_banned_time, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime report types. The **queue** grouping allowed for the calls_blocked_percentage, count_blocked_calls, average_abandonment_rate, count_abandonment_calls, service_level, occupancy_rate, min_time_in_queue, max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime report types
         */
        groupBy?: string;
        /**
         * Maximum waiting time. Required for the **service_level** report type
         */
        maxWaitingSec?: number;
    }
    interface GetSmartQueueRealtimeMetricsResponse {
        result: SmartQueueMetricsResult[];
        /**
         * The used timezone, e.g., 'Etc/GMT'
         */
        timezone: string;
        error?: APIError;
    }
    interface GetSmartQueueDayHistoryRequest {
        /**
         * The application ID to search by
         */
        applicationId: number;
        /**
         * The application name to search by. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName: string;
        /**
         * The SmartQueue ID list with a maximum of 5 values separated by semicolons (;). Can operate as filter for the **calls_blocked_percentage**, **count_blocked_calls**, **average_abandonment_rate**, **count_abandonment_calls**, **service_level**, **occupancy_rate**, **min_time_in_queue**, **max_time_in_queue**, **average_time_in_queue**, **min_answer_speed**, **max_answer_speed**, **average_answer_speed**, **min_handle_time**, **max_handle_time**, **average_handle_time**, **count_handled_calls**, **min_after_call_worktime**, **max_after_call_worktime**, **average_after_call_worktime** report types
         */
        sqQueueId: 'any' | number | number[];
        /**
         * The report type. Possible values are: calls_blocked_percentage, count_blocked_calls, im_blocked_chats_percentage, im_count_blocked_chats, im_answered_chats_rate, average_abandonment_rate, count_abandonment_calls, service_level, im_service_level, occupancy_rate, im_agent_occupancy_rate, agent_utilization_rate, im_agent_utilization_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_in_service_incoming_time, sum_agents_in_service_outcoming_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_custom_1_time, sum_agents_custom_2_time, sum_agents_custom_3_time, sum_agents_custom_4_time, sum_agents_custom_5_time, sum_agents_custom_6_time, sum_agents_custom_7_time, sum_agents_custom_8_time, sum_agents_custom_9_time, sum_agents_custom_10_time, sum_agents_banned_time, im_sum_agents_online_time, im_sum_agents_ready_time, im_sum_agents_in_service_time, im_sum_agents_dnd_time, im_sum_agents_custom_1_time, im_sum_agents_custom_2_time, im_sum_agents_custom_3_time, im_sum_agents_custom_4_time, im_sum_agents_custom_5_time, im_sum_agents_custom_6_time, im_sum_agents_custom_7_time, im_sum_agents_custom_8_time, im_sum_agents_custom_9_time, im_sum_agents_custom_10_time, im_sum_agents_banned_time, average_agents_idle_time, max_agents_idle_time, min_agents_idle_time, percentile_0_25_agents_idle_time, percentile_0_50_agents_idle_time, percentile_0_75_agents_idle_time, min_time_in_queue, max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, im_min_answer_speed, im_max_answer_speed, im_average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime, count_agent_unanswered_calls, im_count_agent_unanswered_chats, min_reaction_time, max_reaction_time, average_reaction_time, im_min_reaction_time, im_max_reaction_time, im_average_reaction_time, im_count_abandonment_chats, im_count_lost_chats, im_lost_chats_rate
         */
        reportType: string | string[];
        /**
         * The user ID list with a maximum of 5 values separated by semicolons (;). Use the 'all' value to select all users. Can operate as a filter for the **occupancy_rate**, **sum_agents_online_time**, **sum_agents_ready_time**, **sum_agents_dialing_time**, **sum_agents_in_service_time**, **sum_agents_afterservice_time**, **sum_agents_dnd_time**, **sum_agents_banned_time**, **min_handle_time**, **max_handle_time**, **average_handle_time**, **count_handled_calls**, **min_after_call_worktime**, **max_after_call_worktime**, **average_after_call_worktime** report types
         */
        userId?: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;). <b>user_name</b> can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * The SmartQueue name list separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * The from date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss. Default is the current time minus 1 day
         */
        fromDate?: Date;
        /**
         * The to date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss. Default is the current time
         */
        toDate?: Date;
        /**
         * The selected timezone or the 'auto' value (the account location)
         */
        timezone?: string;
        /**
         * Interval format: YYYY-MM-DD HH:mm:ss. Default is 1 day
         */
        interval?: string;
        /**
         * Group the result by **agent** or *queue*. The **agent** grouping is allowed only for 1 queue and for the occupancy_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_banned_time, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime report types. The **queue** grouping allowed for the calls_blocked_percentage, count_blocked_calls, average_abandonment_rate, count_abandonment_calls, service_level, occupancy_rate, min_time_in_queue, max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime report types
         */
        groupBy?: string;
        /**
         * Maximum waiting time. Required for the **service_level** report type
         */
        maxWaitingSec?: number;
    }
    interface GetSmartQueueDayHistoryResponse {
        result: SmartQueueMetricsResult[];
        /**
         * The used timezone, e.g., 'Etc/GMT'
         */
        timezone: string;
        error?: APIError;
    }
    interface RequestSmartQueueHistoryRequest {
        /**
         * The application ID to search by
         */
        applicationId: number;
        /**
         * The application name to search by. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName: string;
        /**
         * The SmartQueue ID list with a maximum of 5 values separated by semicolons (;). Can operate as filter for the **calls_blocked_percentage**, **count_blocked_calls**, **average_abandonment_rate**, **count_abandonment_calls**, **service_level**, **occupancy_rate**, **min_time_in_queue**, **max_time_in_queue**, **average_time_in_queue**, **min_answer_speed**, **max_answer_speed**, **average_answer_speed**, **min_handle_time**, **max_handle_time**, **average_handle_time**, **count_handled_calls**, **min_after_call_worktime**, **max_after_call_worktime**, **average_after_call_worktime** report types
         */
        sqQueueId: 'any' | number | number[];
        /**
         * The from date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss. Default is the current time minus 1 day
         */
        fromDate: Date;
        /**
         * The to date in the selected timezone in 24-h format: YYYY-MM-DD HH:mm:ss. Default is the current time
         */
        toDate: Date;
        /**
         * The report type. Possible values are: calls_blocked_percentage, count_blocked_calls, im_blocked_chats_percentage, im_count_blocked_chats, im_answered_chats_rate, average_abandonment_rate, count_abandonment_calls, service_level, im_service_level, occupancy_rate, im_agent_occupancy_rate, agent_utilization_rate, im_agent_utilization_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_in_service_incoming_time, sum_agents_in_service_outcoming_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_custom_1_time, sum_agents_custom_2_time, sum_agents_custom_3_time, sum_agents_custom_4_time, sum_agents_custom_5_time, sum_agents_custom_6_time, sum_agents_custom_7_time, sum_agents_custom_8_time, sum_agents_custom_9_time, sum_agents_custom_10_time, sum_agents_banned_time, im_sum_agents_online_time, im_sum_agents_ready_time, im_sum_agents_in_service_time, im_sum_agents_dnd_time, im_sum_agents_custom_1_time, im_sum_agents_custom_2_time, im_sum_agents_custom_3_time, im_sum_agents_custom_4_time, im_sum_agents_custom_5_time, im_sum_agents_custom_6_time, im_sum_agents_custom_7_time, im_sum_agents_custom_8_time, im_sum_agents_custom_9_time, im_sum_agents_custom_10_time, im_sum_agents_banned_time, average_agents_idle_time, max_agents_idle_time, min_agents_idle_time, percentile_0_25_agents_idle_time, percentile_0_50_agents_idle_time, percentile_0_75_agents_idle_time, min_time_in_queue, max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, im_min_answer_speed, im_max_answer_speed, im_average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime, count_agent_unanswered_calls, im_count_agent_unanswered_chats, min_reaction_time, max_reaction_time, average_reaction_time, im_min_reaction_time, im_max_reaction_time, im_average_reaction_time, im_count_abandonment_chats, im_count_lost_chats, im_lost_chats_rate
         */
        reportType: string | string[];
        /**
         * The user ID list with a maximum of 5 values separated by semicolons (;). Use the 'all' value to select all users. Can operate as a filter for the **occupancy_rate**, **sum_agents_online_time**, **sum_agents_ready_time**, **sum_agents_dialing_time**, **sum_agents_in_service_time**, **sum_agents_afterservice_time**, **sum_agents_dnd_time**, **sum_agents_banned_time**, **min_handle_time**, **max_handle_time**, **average_handle_time**, **count_handled_calls**, **min_after_call_worktime**, **max_after_call_worktime**, **average_after_call_worktime** report types
         */
        userId?: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * The SmartQueue name list separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * The selected timezone or the 'auto' value (the account location)
         */
        timezone?: string;
        /**
         * Interval format: YYYY-MM-DD HH:mm:ss. Default is 1 day
         */
        interval?: string;
        /**
         * Group the result by **agent** or *queue*. The **agent** grouping is allowed only for 1 queue and for the occupancy_rate, sum_agents_online_time, sum_agents_ready_time, sum_agents_dialing_time, sum_agents_in_service_time, sum_agents_afterservice_time, sum_agents_dnd_time, sum_agents_banned_time, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime report types. The **queue** grouping allowed for the calls_blocked_percentage, count_blocked_calls, average_abandonment_rate, count_abandonment_calls, service_level, occupancy_rate, min_time_in_queue, max_time_in_queue, average_time_in_queue, min_answer_speed, max_answer_speed, average_answer_speed, min_handle_time, max_handle_time, average_handle_time, count_handled_calls, min_after_call_worktime, max_after_call_worktime, average_after_call_worktime report types
         */
        groupBy?: string;
        /**
         * Maximum waiting time. Required for the **service_level** report type
         */
        maxWaitingSec?: number;
    }
    interface RequestSmartQueueHistoryResponse {
        /**
         * 1
         */
        result: number;
        /**
         * History report ID
         */
        historyReportId: number;
        error?: APIError;
    }
    interface GetSQStateRequest {
        /**
         * The application ID to search by
         */
        applicationId: number;
        /**
         * The SmartQueue ID list separated by semicolons (;). Use the 'all' value to select all SmartQueues
         */
        sqQueueId: 'any' | number | number[];
        /**
         * The application name to search by. Can be used instead of the <b>application_id</b> parameter
         */
        applicationName?: string;
        /**
         * The SmartQueue name list separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * The selected timezone or the 'auto' value (the account location)
         */
        timezone?: string;
    }
    interface GetSQStateResponse {
        result: SmartQueueState[];
        error?: APIError;
    }
    interface SQ_SetAgentCustomStatusMappingRequest {
        /**
         * Status name
         */
        sqStatusName: string;
        /**
         * Custom status name
         */
        customStatusName: string;
        /**
         * Application ID
         */
        applicationId: number;
    }
    interface SQ_SetAgentCustomStatusMappingResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_GetAgentCustomStatusMappingRequest {
        /**
         * Application ID
         */
        applicationId?: number;
    }
    interface SQ_GetAgentCustomStatusMappingResponse {
        /**
         * Status name
         */
        sqStatusName: string;
        /**
         * Custom status name
         */
        customStatusName: string;
        error?: APIError;
    }
    interface SQ_DeleteAgentCustomStatusMappingRequest {
        /**
         * Application ID
         */
        applicationId: number;
        /**
         * Status name
         */
        sqStatusName?: string;
    }
    interface SQ_DeleteAgentCustomStatusMappingResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_AddQueueRequest {
        /**
         * ID of the application to bind to
         */
        applicationId: number;
        /**
         * Unique SmartQueue name within the application, up to 100 characters
         */
        sqQueueName: string;
        /**
         * Agent selection strategy for calls. Accepts one of the following values: "MOST_QUALIFIED", "LEAST_QUALIFIED", "MAX_WAITING_TIME"
         */
        callAgentSelection: string;
        /**
         * Call type requests prioritizing strategy. Accepts one of the [SQTaskSelectionStrategies] enum values
         */
        callTaskSelection: string;
        /**
         * Name of the application to bind to. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Agent selection strategy for messages. Accepts one of the following values: "MOST_QUALIFIED", "LEAST_QUALIFIED", "MAX_WAITING_TIME". The default value is **call_agent_selection**
         */
        imAgentSelection?: string;
        /**
         * IM type requests prioritizing strategy. Accepts one of the [SQTaskSelectionStrategies] enum values. The default value is **call_task_selection**
         */
        imTaskSelection?: string;
        fallbackAgentSelection?: string;
        /**
         * Comment, up to 200 characters
         */
        description?: string;
        /**
         * Maximum time in minutes that a CALL-type request can remain in the queue without being assigned to an agent
         */
        callMaxWaitingTime?: number;
        /**
         * Maximum time in minutes that an IM-type request can remain in the queue without being assigned to an agent
         */
        imMaxWaitingTime?: number;
        /**
         * Maximum size of the queue with CALL-type requests
         */
        callMaxQueueSize?: number;
        /**
         * Maximum size of the queue with IM-type requests
         */
        imMaxQueueSize?: number;
        /**
         * The queue's priority from 1 to 100
         */
        priority?: number;
    }
    interface SQ_AddQueueResponse {
        /**
         * ID of the added queue
         */
        sqQueueId: number;
        error?: APIError;
    }
    interface SQ_SetQueueInfoRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * ID of the SmartQueue to search for
         */
        sqQueueId: number;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Name of the SmartQueue to search for. Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string;
        /**
         * New SmartQueue name within the application, up to 100 characters
         */
        newSqQueueName?: string;
        /**
         * Agent selection strategy for calls. Accepts one of the following values: "MOST_QUALIFIED", "LEAST_QUALIFIED", "MAX_WAITING_TIME"
         */
        callAgentSelection?: string;
        /**
         * Agent selection strategy for messages. Accepts one of the following values: "MOST_QUALIFIED", "LEAST_QUALIFIED", "MAX_WAITING_TIME". The default value is **call_agent_selection**
         */
        imAgentSelection?: string;
        /**
         * Strategy of prioritizing CALL-type requests for service. Accepts one of the following values: "MAX_PRIORITY", "MAX_WAITING_TIME"
         */
        callTaskSelection?: string;
        /**
         * Strategy of prioritizing IM-type requests for service. Accepts one of the following values: "MAX_PRIORITY", "MAX_WAITING_TIME". The default value is **call_task_selection**
         */
        imTaskSelection?: string;
        fallbackAgentSelection?: string;
        /**
         * Comment, up to 200 characters
         */
        description?: string;
        /**
         * Maximum time in minutes that a CALL-type request can remain in the queue without being assigned to an agent
         */
        callMaxWaitingTime?: number;
        /**
         * Maximum time in minutes that an IM-type request can remain in the queue without being assigned to an agent
         */
        imMaxWaitingTime?: number;
        /**
         * Maximum size of the queue with CALL-type requests
         */
        callMaxQueueSize?: number;
        /**
         * Maximum size of the queue with IM-type requests
         */
        imMaxQueueSize?: number;
        /**
         * The queue's priority from 1 to 100
         */
        priority?: number;
    }
    interface SQ_SetQueueInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_DelQueueRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * List of SmartQueue IDs separated by semicolons (;). Use 'all' to delete all the queues
         */
        sqQueueId: 'any' | number | number[];
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of SmartQueue names separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
    }
    interface SQ_DelQueueResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_GetQueuesRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of SmartQueue IDs separated by semicolons (;)
         */
        sqQueueId?: 'any' | number | number[];
        /**
         * List of SmartQueue names separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * Substring of the SmartQueue name to filter
         */
        sqQueueNameTemplate?: string;
        /**
         * ID of the user that is bound to the queue
         */
        userId?: number;
        /**
         * Name of the user that is bound to the queue. Can be used instead of <b>user_id</b>
         */
        userName?: string;
        /**
         * ID of the user that is not bound to the queue
         */
        excludedUserId?: number;
        /**
         * Name of the user that is not bound to the queue. Can be used instead of <b>excluded_user_id</b>
         */
        excludedUserName?: string;
        /**
         * Number of items to show in the output
         */
        count?: number;
        /**
         * Number of items to skip in the output
         */
        offset?: number;
        /**
         * Whether to include the number of agents bound to the queue
         */
        withAgentcount?: boolean;
    }
    interface SQ_GetQueuesResponse {
        /**
         * The found queue(s)
         */
        result: GetSQQueuesResult;
        error?: APIError;
    }
    interface SQ_AddSkillRequest {
        /**
         * ID of the application to bind to
         */
        applicationId: number;
        /**
         * Unique skill name within the application
         */
        sqSkillName: string;
        /**
         * Name of the application to bind to. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Comment, up to 200 characters
         */
        description?: string;
    }
    interface SQ_AddSkillResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_DelSkillRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * List of skill IDs separated by semicolons (;). Use 'all' to delete all the skills
         */
        sqSkillId: 'any' | number | number[];
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of skill names separated by semicolons (;). Can be used instead of <b>sq_skill_id</b>
         */
        sqSkillName?: string | string[];
    }
    interface SQ_DelSkillResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_SetSkillInfoRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * ID of the skill
         */
        sqSkillId: number;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Name of the skill. Can be used instead of <b>sq_skill_id</b>
         */
        sqSkillName?: string;
        /**
         * New unique skill name within the application
         */
        newSqSkillName?: string;
        /**
         * Comment, up to 200 characters
         */
        description?: string;
    }
    interface SQ_SetSkillInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_BindSkillRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * List of user IDs separated by semicolons (;). Use 'all' to select all the users
         */
        userId: 'any' | number | number[];
        /**
         * Skills to be bound to agents in the json array format. The array should contain objects with the <b>sq_skill_id</b>/<b>sq_skill_name</b> and <b>sq_skill_level</b> keys where skill levels range from 1 to 5
         */
        sqSkills: any;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * Binding mode. Accepts one of the [SQSkillBindingModes] enum values
         */
        bindMode?: string;
    }
    interface SQ_BindSkillResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_UnbindSkillRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * List of user IDs separated by semicolons (;). Use 'all' to select all the users
         */
        userId: 'any' | number | number[];
        /**
         * List of skill IDs separated by semicolons (;). Use 'all' to undbind all the skills
         */
        sqSkillId: 'any' | number | number[];
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * List of skill names separated by semicolons (;). Can be used instead of <b>sq_skill_id</b>
         */
        sqSkillName?: string | string[];
    }
    interface SQ_UnbindSkillResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_GetSkillsRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of user IDs separated by semicolons (;)
         */
        userId?: 'any' | number | number[];
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * List of skill IDs separated by semicolons (;)
         */
        sqSkillId?: 'any' | number | number[];
        /**
         * List of skill names separated by semicolons (;). Can be used instead of <b>sq_skill_id</b>
         */
        sqSkillName?: string | string[];
        /**
         * Substring of the skill name to filter, case-insensitive
         */
        sqSkillNameTemplate?: string;
        /**
         * ID of the user that is not bound to the skill
         */
        excludedUserId?: number;
        /**
         * Name of the user that is not bound to the skill. Can be used instead of <b>excluded_user_id</b>
         */
        excludedUserName?: string;
        /**
         * Number of items to show in the output
         */
        count?: number;
        /**
         * Number of items to skip in the output
         */
        offset?: number;
    }
    interface SQ_GetSkillsResponse {
        /**
         * The found skill(s).
         */
        result: GetSQSkillsResult;
        error?: APIError;
    }
    interface SQ_BindAgentRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * ID of the SmartQueue. Pass a list of values divided by ; or the "all" keyword
         */
        sqQueueId: string;
        /**
         * List of user IDs separated by semicolons (;). Use 'all' to select all the users
         */
        userId: 'any' | number | number[];
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Name of the SmartQueue. Pass a list of names divided by ; or the "all" keyword
         */
        sqQueueName?: string;
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * Binding mode. Accepts one of the [SQAgentBindingModes] enum values
         */
        bindMode?: string;
    }
    interface SQ_BindAgentResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_UnbindAgentRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * List of SmartQueue IDs separated by semicolons (;). Use 'all' to select all the queues
         */
        sqQueueId: 'any' | number | number[];
        /**
         * List of user IDs separated by semicolons (;). Use 'all' to select all the users
         */
        userId: 'any' | number | number[];
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of SmartQueue names separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
    }
    interface SQ_UnbindAgentResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SQ_GetAgentsRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * Whether the agent can handle calls. When set to false, the agent is excluded from the CALL-request distribution
         */
        handleCalls: boolean;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of SmartQueue IDs separated by semicolons (;). Use 'all' to select all the queues
         */
        sqQueueId?: 'any' | number | number[];
        /**
         * List of SmartQueue names separated by semicolons (;). Can be used instead of <b>sq_queue_id</b>
         */
        sqQueueName?: string | string[];
        /**
         * ID of the SmartQueue to exclude
         */
        excludedSqQueueId?: number;
        /**
         * Name of the SmartQueue to exclude. Can be used instead of <b>excluded_sq_queue_id</b>
         */
        excludedSqQueueName?: string;
        /**
         * Skills to filter in the json array format. The array should contain objects with the <b>sq_skill_id</b>/<b>sq_skill_name</b>, <b>min_sq_skill_level</b>, and <b>max_sq_skill_level</b> keys where skill levels range from 1 to 5
         */
        sqSkills?: any;
        /**
         * List of user IDs separated by semicolons (;)
         */
        userId?: 'any' | number | number[];
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * Substring of the user name to filter
         */
        userNameTemplate?: string;
        /**
         * Filter statuses in the json array format. The array should contain objects with the <b>sq_status_type</b> and <b>sq_status_name</b> keys. Possible values for <b>sq_status_type</b> are 'CALL' and'IM'. Possible values for <b>sq_status_name</b> are 'OFFLINE', 'ONLINE', 'READY', 'IN_SERVICE', 'AFTER_SERVICE', 'DND'
         */
        sqStatuses?: any;
        /**
         * Whether to display agent skills
         */
        withSqSkills?: boolean;
        /**
         * Whether to display agent queues
         */
        withSqQueues?: boolean;
        /**
         * Whether to display agent current statuses
         */
        withSqStatuses?: boolean;
        /**
         * Number of items to show in the output
         */
        count?: number;
        /**
         * Number of items to skip in the output
         */
        offset?: number;
    }
    interface SQ_GetAgentsResponse {
        /**
         * The found agent(s)
         */
        result: GetSQAgentsResult;
        error?: APIError;
    }
    interface SQ_SetAgentInfoRequest {
        /**
         * ID of the application to search by
         */
        applicationId: number;
        /**
         * List of user IDs separated by semicolons (;). Use 'all' to select all the users
         */
        userId: 'any' | number | number[];
        /**
         * Whether the agent can handle calls. When set to false, the agent is excluded from the CALL-request distribution
         */
        handleCalls: boolean;
        /**
         * Name of the application to search by. Can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * List of user names separated by semicolons (;). Can be used instead of <b>user_id</b>
         */
        userName?: string | string[];
        /**
         * Maximum number of chats that the user processes simultaneously
         */
        maxSimultaneousConversations?: number;
    }
    interface SQ_SetAgentInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SmartQueueInterface {
        /**
         * Gets the metrics for the specified SmartQueue for the last 30 minutes. Refer to the <a href="/docs/guides/contact-center/reporting">SmartQueue reporting guide</a> to learn more.
         */
        getSmartQueueRealtimeMetrics: (request: GetSmartQueueRealtimeMetricsRequest) => Promise<GetSmartQueueRealtimeMetricsResponse>;
        /**
         * Gets the metrics for the specified SmartQueue for the last 2 days. Refer to the <a href="/docs/guides/contact-center/reporting">SmartQueue reporting guide</a> to learn more.
         */
        getSmartQueueDayHistory: (request: GetSmartQueueDayHistoryRequest) => Promise<GetSmartQueueDayHistoryResponse>;
        /**
         * Gets history for the specified SmartQueue. Refer to the <a href="/docs/guides/contact-center/reporting">SmartQueue reporting guide</a> to learn more.
         */
        requestSmartQueueHistory: (request: RequestSmartQueueHistoryRequest) => Promise<RequestSmartQueueHistoryResponse>;
        /**
         * Gets the current state of the specified SmartQueue.
         */
        getSQState: (request: GetSQStateRequest) => Promise<GetSQStateResponse>;
        /**
         * Adds a status if there is no match for the given internal status and renames it if there is a match. It means that if the passed **sq_status_name** parameter is not in the mapping table, a new entry is created in there; if it is, the **name** field in its mapping is replaced with **custom_status_name**.
         */
        sQ_SetAgentCustomStatusMapping: (request: SQ_SetAgentCustomStatusMappingRequest) => Promise<SQ_SetAgentCustomStatusMappingResponse>;
        /**
         * Returns the mapping list of SQ statuses and custom statuses. SQ statuses are returned whether or not they have mappings to custom statuses.
         */
        sQ_GetAgentCustomStatusMapping: (request: SQ_GetAgentCustomStatusMappingRequest) => Promise<SQ_GetAgentCustomStatusMappingResponse>;
        /**
         * Removes a mapping from the mapping table. If there is no such mapping, does nothing.
         */
        sQ_DeleteAgentCustomStatusMapping: (request: SQ_DeleteAgentCustomStatusMappingRequest) => Promise<SQ_DeleteAgentCustomStatusMappingResponse>;
        /**
         * Adds a new queue.
         */
        sQ_AddQueue: (request: SQ_AddQueueRequest) => Promise<SQ_AddQueueResponse>;
        /**
         * Edits an existing queue.
         */
        sQ_SetQueueInfo: (request: SQ_SetQueueInfoRequest) => Promise<SQ_SetQueueInfoResponse>;
        /**
         * Deletes a queue.
         */
        sQ_DelQueue: (request: SQ_DelQueueRequest) => Promise<SQ_DelQueueResponse>;
        /**
         * Gets the queue(s).
         */
        sQ_GetQueues: (request: SQ_GetQueuesRequest) => Promise<SQ_GetQueuesResponse>;
        /**
         * Adds a new skill to the app.
         */
        sQ_AddSkill: (request: SQ_AddSkillRequest) => Promise<SQ_AddSkillResponse>;
        /**
         * Deletes a skill and detaches it from agents.
         */
        sQ_DelSkill: (request: SQ_DelSkillRequest) => Promise<SQ_DelSkillResponse>;
        /**
         * Edits an existing skill.
         */
        sQ_SetSkillInfo: (request: SQ_SetSkillInfoRequest) => Promise<SQ_SetSkillInfoResponse>;
        /**
         * Binds skills to agents.
         */
        sQ_BindSkill: (request: SQ_BindSkillRequest) => Promise<SQ_BindSkillResponse>;
        /**
         * Unbinds skills from agents.
         */
        sQ_UnbindSkill: (request: SQ_UnbindSkillRequest) => Promise<SQ_UnbindSkillResponse>;
        /**
         * Gets the skill(s).
         */
        sQ_GetSkills: (request: SQ_GetSkillsRequest) => Promise<SQ_GetSkillsResponse>;
        /**
         * Binds agents to a queue.
         */
        sQ_BindAgent: (request: SQ_BindAgentRequest) => Promise<SQ_BindAgentResponse>;
        /**
         * Unbinds agents from queues.
         */
        sQ_UnbindAgent: (request: SQ_UnbindAgentRequest) => Promise<SQ_UnbindAgentResponse>;
        /**
         * Gets agents.
         */
        sQ_GetAgents: (request: SQ_GetAgentsRequest) => Promise<SQ_GetAgentsResponse>;
        /**
         * Edits the agent settings.
         */
        sQ_SetAgentInfo: (request: SQ_SetAgentInfoRequest) => Promise<SQ_SetAgentInfoResponse>;
    }
    interface AddSkillRequest {
        /**
         * The ACD operator skill name. The length must be less than 512
         */
        skillName: string;
    }
    interface AddSkillResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The skill ID
         */
        skillId: number;
        error?: APIError;
    }
    interface DelSkillRequest {
        /**
         * The skill ID
         */
        skillId: number;
        /**
         * The skill name that can be used instead of <b>skill_id</b>
         */
        skillName: string;
    }
    interface DelSkillResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetSkillInfoRequest {
        /**
         * The skill ID
         */
        skillId: number;
        /**
         * The skill name that can be used instead of <b>skill_id</b>
         */
        skillName: string;
        /**
         * The new skill name. The length must be less than 512
         */
        newSkillName: string;
    }
    interface SetSkillInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetSkillsRequest {
        /**
         * The skill ID to filter
         */
        skillId?: number;
        /**
         * The skill name part to filter
         */
        skillName?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetSkillsResponse {
        result: SkillInfo[];
        /**
         * The total found skill count
         */
        totalCount: number;
        /**
         * The returned skill count
         */
        count: number;
        error?: APIError;
    }
    interface BindSkillRequest {
        /**
         * The skill ID list separated by semicolons (;). Use the 'all' value to select all skills
         */
        skillId: 'any' | number | number[];
        /**
         * The skill name list separated by semicolons (;). Can be used instead of <b>skill_id</b>
         */
        skillName: string | string[];
        /**
         * The user ID list separated by semicolons (;). Use the 'all' value to select all users
         */
        userId: 'any' | number | number[];
        /**
         * The user name list separated by semicolons (;). <b>user_name</b> can be used instead of <b>user_id</b>
         */
        userName: string | string[];
        /**
         * The ACD queue ID list separated by semicolons (;). Use the 'all' value to select all ACD queues
         */
        acdQueueId: 'any' | number | number[];
        /**
         * The ACD queue name that can be used instead of <b>acd_queue_id</b>. The ACD queue name list separated by semicolons (;)
         */
        acdQueueName: string | string[];
        /**
         * The application ID. It is required if the <b>user_name</b> is specified
         */
        applicationId?: number;
        /**
         * The application name that can be used instead of <b>application_id</b>
         */
        applicationName?: string;
        /**
         * Whether to bind or unbind (set true or false respectively)
         */
        bind?: boolean;
    }
    interface BindSkillResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SkillsInterface {
        /**
         * Adds a new operator's skill. Works only for ACDv1. For SmartQueue/ACDv2, use <a href="#how-auth-works">this reference</a>.
         */
        addSkill: (request: AddSkillRequest) => Promise<AddSkillResponse>;
        /**
         * Deletes an operator's skill. Works only for ACDv1. For SmartQueue/ACDv2, use <a href="#how-auth-works">this reference</a>.
         */
        delSkill: (request: DelSkillRequest) => Promise<DelSkillResponse>;
        /**
         * Edits an operator's skill. Works only for ACDv1. For SmartQueue/ACDv2, use <a href="#how-auth-works">this reference</a>.
         */
        setSkillInfo: (request: SetSkillInfoRequest) => Promise<SetSkillInfoResponse>;
        /**
         * Gets the skills of an operator. Works only for ACDv1. For SmartQueue/ACDv2, use <a href="#how-auth-works">this reference</a>.
         */
        getSkills: (request: GetSkillsRequest) => Promise<GetSkillsResponse>;
        /**
         * Binds the specified skills to the users (ACD operators) and/or the ACD queues. Works only for ACDv1. For SmartQueue/ACDv2, use <a href="#how-auth-works">this reference</a>.
         */
        bindSkill: (request: BindSkillRequest) => Promise<BindSkillResponse>;
    }
    interface AddAdminUserRequest {
        /**
         * The admin user name. The length must be less than 50
         */
        newAdminUserName: string;
        /**
         * The admin user display name. The length must be less than 256
         */
        adminUserDisplayName: string;
        /**
         * The admin user password. The length must be at least 6 symbols
         */
        newAdminUserPassword: string;
        /**
         * Whether the admin user is active
         */
        adminUserActive?: boolean;
        /**
         * The role(s) ID created via <a href='/docs/references/httpapi/adminroles'>Managing Admin Roles</a> methods. The attaching admin role ID list separated by semicolons (;). Use the 'all' value to select all admin roles
         */
        adminRoleId?: string;
        /**
         * The role(s) name(s) created via <a href='/docs/references/httpapi/adminroles'>Managing Admin Roles</a> methods. The attaching admin role name that can be used instead of <b>admin_role_id</b>
         */
        adminRoleName?: string | string[];
    }
    interface AddAdminUserResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The new admin user ID
         */
        adminUserId: number;
        /**
         * The admin user API key
         */
        adminUserApiKey: string;
        error?: APIError;
    }
    interface DelAdminUserRequest {
        /**
         * The admin user ID list separated by semicolons (;). Use the 'all' value to select all admin users
         */
        requiredAdminUserId: 'any' | number | number[];
        /**
         * The admin user name to delete, can be used instead of <b>required_admin_user_id</b>
         */
        requiredAdminUserName: string | string[];
    }
    interface DelAdminUserResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetAdminUserInfoRequest {
        /**
         * The admin user to edit
         */
        requiredAdminUserId: number;
        /**
         * The admin user to edit, can be used instead of <b>required_admin_user_id</b>
         */
        requiredAdminUserName: string;
        /**
         * The new admin user name. The length must be less than 50
         */
        newAdminUserName?: string;
        /**
         * The new admin user display name. The length must be less than 256
         */
        adminUserDisplayName?: string;
        /**
         * The new admin user password. The length must be at least 6 symbols
         */
        newAdminUserPassword?: string;
        /**
         * Whether the admin user is active
         */
        adminUserActive?: boolean;
    }
    interface SetAdminUserInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetAdminUsersRequest {
        /**
         * The admin user ID to filter
         */
        requiredAdminUserId?: number;
        /**
         * The admin user name part to filter
         */
        requiredAdminUserName?: string;
        /**
         * The admin user display name part to filter
         */
        adminUserDisplayName?: string;
        /**
         * Whether the admin user is active to filter
         */
        adminUserActive?: boolean;
        /**
         * Whether to get the attached admin roles
         */
        withRoles?: boolean;
        /**
         * Whether to get the admin user permissions
         */
        withAccessEntries?: boolean;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetAdminUsersResponse {
        result: AdminUser[];
        /**
         * The total found admin user count
         */
        totalCount: number;
        /**
         * The returned admin user count
         */
        count: number;
        error?: APIError;
    }
    interface AttachAdminRoleRequest {
        /**
         * The admin user ID list separated by semicolons (;). Use the 'all' value to select all admin users
         */
        requiredAdminUserId: 'any' | number | number[];
        /**
         * The admin user name to bind, can be used instead of <b>required_admin_user_id</b>
         */
        requiredAdminUserName: string | string[];
        /**
         * The role(s) ID created via <a href='/docs/references/httpapi/adminroles'>Managing Admin Roles</a> methods. The attached admin role ID list separated by semicolons (;). Use the 'all' value to select alladmin roles
         */
        adminRoleId: 'any' | number | number[];
        /**
         * The role(s) name(s) created via <a href='/docs/references/httpapi/adminroles'>Managing Admin Roles</a> methods. The admin role name to attach, can be used instead of <b>admin_role_id</b>
         */
        adminRoleName: string | string[];
        /**
         * The merge mode. The following values are possible: add, del, set
         */
        mode?: string;
    }
    interface AttachAdminRoleResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface AdminUsersInterface {
        /**
         * Adds a new admin user into the specified parent or child account.
         */
        addAdminUser: (request: AddAdminUserRequest) => Promise<AddAdminUserResponse>;
        /**
         * Deletes the specified admin user.
         */
        delAdminUser: (request: DelAdminUserRequest) => Promise<DelAdminUserResponse>;
        /**
         * Edits the specified admin user.
         */
        setAdminUserInfo: (request: SetAdminUserInfoRequest) => Promise<SetAdminUserInfoResponse>;
        /**
         * Gets the admin users of the specified account. Note that both account types - parent and child - can have its own admins.
         */
        getAdminUsers: (request: GetAdminUsersRequest) => Promise<GetAdminUsersResponse>;
        /**
         * Attaches the admin role(s) to the already existing admin(s).
         */
        attachAdminRole: (request: AttachAdminRoleRequest) => Promise<AttachAdminRoleResponse>;
    }
    interface AddAdminRoleRequest {
        /**
         * The admin role name. The length must be less than 50
         */
        adminRoleName: string;
        /**
         * Whether the admin role is enabled. If false the allowed and denied entries have no affect
         */
        adminRoleActive?: boolean;
        /**
         * The admin role ID list separated by semicolons (;). Use the 'all' value to select all admin roles. The list specifies the roles from which the new role automatically copies all permissions (allowed_entries and denied_entries)
         */
        likeAdminRoleId?: 'any' | number | number[];
        /**
         * The admin role name that can be used instead of <b>like_admin_role_id</b>. The name specifies a role from which the new role automatically copies all permissions (allowed_entries and denied_entries)
         */
        likeAdminRoleName?: string | string[];
        /**
         * The list of allowed access entries separated by semicolons (;) (the API function names)
         */
        allowedEntries?: string | string[];
        /**
         * The list of denied access entries separated by semicolons (;) (the API function names)
         */
        deniedEntries?: string | string[];
    }
    interface AddAdminRoleResponse {
        /**
         * 1
         */
        result: number;
        /**
         * The new admin role ID
         */
        adminRoleId: number;
        error?: APIError;
    }
    interface DelAdminRoleRequest {
        /**
         * The admin role ID list separated by semicolons (;). Use the 'all' value to select all admin roles
         */
        adminRoleId: 'any' | number | number[];
        /**
         * The admin role name to delete, can be used instead of <b>admin_role_id</b>
         */
        adminRoleName: string | string[];
    }
    interface DelAdminRoleResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface SetAdminRoleInfoRequest {
        /**
         * The admin role to edit
         */
        adminRoleId: number;
        /**
         * The admin role to edit, can be used instead of <b>admin_role_id</b>
         */
        adminRoleName: string;
        /**
         * The new admin role name. The length must be less than 50
         */
        newAdminRoleName?: string;
        /**
         * Whether the admin role is enabled. If false the allowed and denied entries have no affect
         */
        adminRoleActive?: boolean;
        /**
         * The modification mode of the permission lists (allowed_entries and denied_entries). The following values are possible: add, del, set
         */
        entryModificationMode?: string;
        /**
         * The list of allowed access entry changes separated by semicolons (;) (the API function names)
         */
        allowedEntries?: string | string[];
        /**
         * The list of denied access entry changes separated by semicolons (;) (the API function names)
         */
        deniedEntries?: string | string[];
        /**
         * The admin role ID list separated by semicolons (;). Use the 'all' value to select all admin roles. The list specifies the roles from which the allowed_entries and denied_entries are merged
         */
        likeAdminRoleId?: 'any' | number | number[];
        /**
         * The admin role name, can be used instead of <b>like_admin_role_id</b>. The name specifies a role from which the allowed_entries and denied_entries are merged
         */
        likeAdminRoleName?: string | string[];
    }
    interface SetAdminRoleInfoResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface GetAdminRolesRequest {
        /**
         * The admin role ID to filter
         */
        adminRoleId?: number;
        /**
         * The admin role name part to filter
         */
        adminRoleName?: string;
        /**
         * Whether the admin role is enabled to filter
         */
        adminRoleActive?: boolean;
        /**
         * Whether to get the permissions
         */
        withEntries?: boolean;
        /**
         * Whether to include the account roles
         */
        withAccountRoles?: boolean;
        /**
         * Whether to include the parent roles
         */
        withParentRoles?: boolean;
        withSystemRoles?: boolean;
        /**
         * The attached admin user ID list separated by semicolons (;). Use the 'all' value to select all admin users
         */
        includedAdminUserId?: 'any' | number | number[];
        /**
         * Not attached admin user ID list separated by semicolons (;). Use the 'all' value to select all admin users
         */
        excludedAdminUserId?: 'any' | number | number[];
        /**
         * Set false to get roles with partial admin user list matching
         */
        fullAdminUsersMatching?: string;
        /**
         * The admin user to show in the 'admin_users' field output
         */
        showingAdminUserId?: number;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
    }
    interface GetAdminRolesResponse {
        result: AdminRole[];
        /**
         * The total found admin role count
         */
        totalCount: number;
        /**
         * The returned admin role count
         */
        count: number;
        error?: APIError;
    }
    interface GetAvailableAdminRoleEntriesRequest {
    }
    interface GetAvailableAdminRoleEntriesResponse {
        /**
         * Array of the admin role entries
         */
        result: string[];
        error?: APIError;
    }
    interface AdminRolesInterface {
        /**
         * Adds a new admin role.
         */
        addAdminRole: (request: AddAdminRoleRequest) => Promise<AddAdminRoleResponse>;
        /**
         * Deletes the specified admin role.
         */
        delAdminRole: (request: DelAdminRoleRequest) => Promise<DelAdminRoleResponse>;
        /**
         * Edits the specified admin role.
         */
        setAdminRoleInfo: (request: SetAdminRoleInfoRequest) => Promise<SetAdminRoleInfoResponse>;
        /**
         * Gets the admin roles.
         */
        getAdminRoles: (request: GetAdminRolesRequest) => Promise<GetAdminRolesResponse>;
        /**
         * Gets the all available admin role entries.
         */
        getAvailableAdminRoleEntries: (request: GetAvailableAdminRoleEntriesRequest) => Promise<GetAvailableAdminRoleEntriesResponse>;
    }
    interface AddAuthorizedAccountIPRequest {
        /**
         * The authorized IP4 or network
         */
        authorizedIp: string;
        /**
         * Whether to remove the IP from the blacklist
         */
        allowed?: boolean;
        /**
         * The IP address description
         */
        description?: string;
    }
    interface AddAuthorizedAccountIPResponse {
        /**
         * 1
         */
        result: number;
        error?: APIError;
    }
    interface DelAuthorizedAccountIPRequest {
        /**
         * The authorized IP4 or network to remove. Set to 'all' to remove all items
         */
        authorizedIp: string;
        /**
         * Specify the parameter to remove the networks that contains the particular IP4. Can be used instead of <b>autharized_ip</b>
         */
        containsIp: string;
        /**
         * Whether to remove the network from the white list. Set false to remove the network from the black list. Omit the parameter to remove the network from all lists
         */
        allowed?: boolean;
    }
    interface DelAuthorizedAccountIPResponse {
        /**
         * The removed network count
         */
        result: number;
        error?: APIError;
    }
    interface GetAuthorizedAccountIPsRequest {
        /**
         * The authorized IP4 or network to filter
         */
        authorizedIp?: string;
        /**
         * Whether the IP is allowed
         */
        allowed?: boolean;
        /**
         * Specify the parameter to filter the networks that contains the particular IP4
         */
        containsIp?: string;
        /**
         * The max returning record count
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        /**
         * The IP address description
         */
        description?: string;
    }
    interface GetAuthorizedAccountIPsResponse {
        result: AuthorizedAccountIP[];
        /**
         * The total found network count
         */
        totalCount: number;
        /**
         * The returned network count
         */
        count: number;
        error?: APIError;
    }
    interface CheckAuthorizedAccountIPRequest {
        /**
         * The IP4 to test
         */
        authorizedIp: string;
    }
    interface CheckAuthorizedAccountIPResponse {
        /**
         * Whether the IP is allowed
         */
        result: boolean;
        /**
         * The matched authorized IP or network (if found)
         */
        authorizedIp?: string;
        error?: APIError;
    }
    interface AuthorizedIPsInterface {
        /**
         * Adds a new authorized IP4 or network to the white/black list.
         */
        addAuthorizedAccountIP: (request: AddAuthorizedAccountIPRequest) => Promise<AddAuthorizedAccountIPResponse>;
        /**
         * Removes the authorized IP4 or network from the white/black list.
         */
        delAuthorizedAccountIP: (request: DelAuthorizedAccountIPRequest) => Promise<DelAuthorizedAccountIPResponse>;
        /**
         * Gets the authorized IP4 or network.
         */
        getAuthorizedAccountIPs: (request: GetAuthorizedAccountIPsRequest) => Promise<GetAuthorizedAccountIPsResponse>;
        /**
         * Tests whether the IP4 is banned or allowed.
         */
        checkAuthorizedAccountIP: (request: CheckAuthorizedAccountIPRequest) => Promise<CheckAuthorizedAccountIPResponse>;
    }
    interface SetDialogflowKeyRequest {
        /**
         * The Dialogflow key's ID
         */
        dialogflowKeyId: number;
        /**
         * The Dialogflow keys's description. To clear previously set description leave the parameter blank or put whitespaces only
         */
        description: string;
    }
    interface SetDialogflowKeyResponse {
        result: number;
        error?: APIError;
    }
    interface DialogflowCredentialsInterface {
        /**
         * Edits a Dialogflow key.
         */
        setDialogflowKey: (request: SetDialogflowKeyRequest) => Promise<SetDialogflowKeyResponse>;
    }
    interface SendSmsMessageRequest {
        /**
         * The source phone number
         */
        source: string;
        /**
         * The destination phone number
         */
        destination: string;
        /**
         * The message text, up to 765 characters. We split long messages greater than 160 GSM-7 characters or 70 UTF-16 characters into multiple segments. Each segment is charged as one message
         */
        smsBody: string;
        /**
         * Whether to store outgoing message texts. Default value is false
         */
        storeBody?: boolean;
    }
    interface SendSmsMessageResponse {
        result: number;
        /**
         * Message ID
         */
        messageId: number;
        /**
         * The number of fragments the message is divided into
         */
        fragmentsCount: number;
        error?: APIError;
    }
    interface A2PSendSmsRequest {
        /**
         * The SenderID for outgoing SMS. Please contact support for installing a SenderID
         */
        srcNumber: string;
        /**
         * The destination phone numbers separated by semicolons (;). The maximum number of these phone numbers is 100
         */
        dstNumbers: string | string[];
        /**
         * The message text, up to 1600 characters. We split long messages greater than 160 GSM-7 characters or 70 UTF-16 characters into multiple segments. Each segment is charged as one message
         */
        text: string;
        /**
         * Whether to store outgoing message texts. Default value is false
         */
        storeBody?: boolean;
    }
    interface A2PSendSmsResponse {
        result: SmsTransaction[];
        failed: FailedSms[];
        /**
         * The number of fragments the message is divided into
         */
        fragmentsCount: number;
        error?: APIError;
    }
    interface ControlSmsRequest {
        /**
         * The phone number
         */
        phoneNumber: string;
        /**
         * The SMS control command. The following values are possible: enable, disable
         */
        command: string;
    }
    interface ControlSmsResponse {
        result: number;
        error?: APIError;
    }
    interface GetSmsHistoryRequest {
        /**
         * The source phone number
         */
        sourceNumber?: string;
        /**
         * The destination phone number
         */
        destinationNumber?: string;
        /**
         * Sent or received SMS. Possible values: 'IN', 'OUT', 'in, 'out'. Leave blank to get both incoming and outgoing messages
         */
        direction?: string;
        /**
         * Maximum number of resulting rows fetched. Must be not bigger than 1000. If left blank, then the default value of 1000 is used
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        /**
         * Date from which to perform search. Format is 'yyyy-MM-dd HH:mm:ss', time zone is UTC
         */
        fromDate?: Date;
        /**
         * Date until which to perform search. Format is 'yyyy-MM-dd HH:mm:ss', time zone is UTC
         */
        toDate?: Date;
        /**
         * The output format. The following values available: json, csv
         */
        output?: string;
    }
    interface GetSmsHistoryResponse {
        result: SmsHistory[];
        /**
         * Total number of messages matching the query parameters
         */
        totalCount: number;
        error?: APIError;
    }
    interface A2PGetSmsHistoryRequest {
        /**
         * The source phone number
         */
        sourceNumber?: string;
        /**
         * The destination phone number
         */
        destinationNumber?: string;
        /**
         * Maximum number of resulting rows fetched. Must be not bigger than 1000. If left blank, then the default value of 1000 is used
         */
        count?: number;
        /**
         * The first <b>N</b> records are skipped in the output
         */
        offset?: number;
        /**
         * Date from which the search is to start. Format is 'yyyy-MM-dd HH:mm:ss', time zone is UTC
         */
        fromDate?: Date;
        /**
         * Date from which the search is to end. Format is 'yyyy-MM-dd HH:mm:ss', time zone is UTC
         */
        toDate?: Date;
        /**
         * The output format. The possible values are json, csv
         */
        output?: string;
        /**
         * The delivery status ID: QUEUED - 1, DISPATCHED - 2, ABORTED - 3, REJECTED - 4, DELIVERED - 5, FAILED - 6, EXPIRED - 7, UNKNOWN - 8
         */
        deliveryStatus?: number;
    }
    interface A2PGetSmsHistoryResponse {
        result: A2PSmsHistory[];
        /**
         * Total number of messages matching the query parameters
         */
        totalCount: number;
        error?: APIError;
    }
    interface SMSInterface {
        /**
         * Sends an SMS message between two phone numbers. The source phone number should be purchased from Voximplant and support SMS (which is indicated by the <b>is_sms_supported</b> property in the objects returned by the [GetPhoneNumbers] Management API) and SMS should be enabled for it via the [ControlSms] Management API. SMS messages can be received via HTTP callbacks, see <a href='/docs/guides/managementapi/callbacks'>this article</a> for details.
         */
        sendSmsMessage: (request: SendSmsMessageRequest) => Promise<SendSmsMessageResponse>;
        /**
         * Sends an SMS message from the application to customers. The source phone number should be purchased from Voximplant and support SMS (which is indicated by the <b>is_sms_supported</b> property in the objects returned by the <a href='/docs/references/httpapi/managing_phone_numbers#getphonenumbers'>/GetPhoneNumbers</a> Management API) and SMS should be enabled for it via the <a href='/docs/references/httpapi/managing_sms#controlsms'>/ControlSms</a> Management API.
         */
        a2PSendSms: (request: A2PSendSmsRequest) => Promise<A2PSendSmsResponse>;
        /**
         * Enables or disables sending and receiving SMS for the phone number. Can be used only for phone numbers with SMS support, which is indicated by the <b>is_sms_supported</b> property in the objects returned by the [GetPhoneNumbers] Management API. Each incoming SMS message is charged according to the <a href='//voximplant.com/pricing'>pricing</a>. If enabled, SMS can be sent from this phone number via the [SendSmsMessage] Management API and received via the [InboundSmsCallback] property of the HTTP callback. See <a href='/docs/guides/managementapi/callbacks'>this article</a> for HTTP callback details.
         */
        controlSms: (request: ControlSmsRequest) => Promise<ControlSmsResponse>;
        /**
         * Gets the history of sent and/or received SMS.
         */
        getSmsHistory: (request: GetSmsHistoryRequest) => Promise<GetSmsHistoryResponse>;
        /**
         * Gets the history of sent/or received A2P SMS.
         */
        a2PGetSmsHistory: (request: A2PGetSmsHistoryRequest) => Promise<A2PGetSmsHistoryResponse>;
    }
    interface GetRecordStoragesRequest {
        /**
         * The record storage ID list separated by semicolons (;)
         */
        recordStorageId?: 'any' | number | number[];
        /**
         * The record storage name list separated by semicolons (;)
         */
        recordStorageName?: string | string[];
        withPrivate?: boolean;
    }
    interface GetRecordStoragesResponse {
        result: RecordStorageInfo;
        error?: APIError;
    }
    interface RecordStoragesInterface {
        /**
         * Gets the record storages.
         */
        getRecordStorages: (request: GetRecordStoragesRequest) => Promise<GetRecordStoragesResponse>;
    }
    interface GetRoleGroupsRequest {
    }
    interface GetRoleGroupsResponse {
        result: RoleGroupView[];
        error?: APIError;
    }
    interface RoleSystemInterface {
        /**
         * Gets role groups.
         */
        getRoleGroups: (request: GetRoleGroupsRequest) => Promise<GetRoleGroupsResponse>;
    }
    interface SetKeyValueItemRequest {
        /**
         * Key, up to 200 characters. A key can contain a namespace that is written before the ':' symbol, for example, test:1234. Thus, namespace 'test' can be used as a pattern in the [GetKeyValueItems](/docs/references/httpapi/keyvaluestorage#getkeyvalueitems) and [GetKeyValueKeys](/docs/references/httpapi/keyvaluestorage#getkeyvaluekeys) methods to find the keys with the same namespace
         */
        key: string;
        /**
         * Value for the specified key, up to 2000 characters
         */
        value: string;
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The application name
         */
        applicationName?: string;
        /**
         * Key expiry time in seconds. The value is in range of 0..7,776,000 (90 days), the default value is 30 days (2,592,000 seconds). The TTL is converted to an **expires_at** Unix timestamp field as part of the storage object. Note that one of the two parameters (ttl or expires_at) must be set
         */
        ttl?: number;
        /**
         * Expiration date based on **ttl** (timestamp without milliseconds). Note that one of the two parameters (ttl or expires_at) must be set
         */
        expiresAt?: number;
    }
    interface SetKeyValueItemResponse {
        /**
         * The key-value item
         */
        result: KeyValueItems;
        error?: APIError;
    }
    interface DelKeyValueItemRequest {
        /**
         * Key, up to 200 characters
         */
        key: string;
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The application name
         */
        applicationName?: string;
    }
    interface DelKeyValueItemResponse {
        result: number;
        error?: APIError;
    }
    interface GetKeyValueItemRequest {
        /**
         * Key, up to 200 characters
         */
        key: string;
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * The application name
         */
        applicationName?: string;
    }
    interface GetKeyValueItemResponse {
        /**
         * The key-value item
         */
        result: KeyValueItems;
        error?: APIError;
    }
    interface GetKeyValueItemsRequest {
        /**
         * Namespace that keys should contain, up to 200 characters
         */
        key: string;
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * Number of items to show per page with a maximum value of 50. Default value is 10
         */
        count?: number;
        /**
         * Number of items to skip (e.g. if you set count = 20 and offset = 0 the first time, the next time, offset has to be equal to 20 to skip the items shown earlier). Default value is 0
         */
        offset?: number;
        /**
         * The application name
         */
        applicationName?: string;
    }
    interface GetKeyValueItemsResponse {
        /**
         * The key-value pairs
         */
        result: KeyValueItems;
        error?: APIError;
    }
    interface GetKeyValueKeysRequest {
        /**
         * The application ID
         */
        applicationId: number;
        /**
         * Namespace that keys should contain, up to 200 characters
         */
        key?: string;
        /**
         * Number of items to show per page with a maximum value of 50. Default value is 10
         */
        count?: number;
        /**
         * Number of items to skip (e.g. if you set count = 20 and offset = 0 the first time, the next time, offset has to be equal to 20 to skip the items shown earlier). Default value is 0
         */
        offset?: number;
        /**
         * The application name
         */
        applicationName?: string;
    }
    interface GetKeyValueKeysResponse {
        /**
         * The key-value keys
         */
        result: KeyValueKeys;
        error?: APIError;
    }
    interface KeyValueStorageInterface {
        /**
         * Creates or updates a key-value pair. If an existing key is passed, the method returns the existing item and changes the value if needed. The keys should be unique within a Voximplant application.
         */
        setKeyValueItem: (request: SetKeyValueItemRequest) => Promise<SetKeyValueItemResponse>;
        /**
         * Deletes the specified key-value pair from the storage.
         */
        delKeyValueItem: (request: DelKeyValueItemRequest) => Promise<DelKeyValueItemResponse>;
        /**
         * Gets the specified key-value pair from the storage.
         */
        getKeyValueItem: (request: GetKeyValueItemRequest) => Promise<GetKeyValueItemResponse>;
        /**
         * Gets all the key-value pairs in which the keys begin with a pattern.
         */
        getKeyValueItems: (request: GetKeyValueItemsRequest) => Promise<GetKeyValueItemsResponse>;
        /**
         * Gets all the keys of key-value pairs.
         */
        getKeyValueKeys: (request: GetKeyValueKeysRequest) => Promise<GetKeyValueKeysResponse>;
    }
    interface GetAccountInvoicesRequest {
        status?: string;
        /**
         * Number of invoices to show per page. Default value is 20
         */
        count?: number;
        /**
         * Number of invoices to skip (e.g. if you set count = 20 and offset = 0 the first time, the next time, offset has to be equal to 20 to skip the items shown earlier). Default value is 0
         */
        offset?: number;
    }
    interface GetAccountInvoicesResponse {
        /**
         * Array of the account invoices
         */
        result: AccountInvoice;
        /**
         * Total number of invoices matching the query parameters
         */
        totalCount: number;
        /**
         * Number of returned invoices matching the query parameters
         */
        count: number;
        error?: APIError;
    }
    interface InvoicesInterface {
        /**
         * Gets all invoices of the specified USD or EUR account.
         */
        getAccountInvoices: (request: GetAccountInvoicesRequest) => Promise<GetAccountInvoicesResponse>;
    }
    class Client {
        
        Accounts: AccountsInterface;
        Applications: ApplicationsInterface;
        Users: UsersInterface;
        CallLists: CallListsInterface;
        Scenarios: ScenariosInterface;
        History: HistoryInterface;
        PSTNBlacklist: PSTNBlacklistInterface;
        SIPWhiteList: SIPWhiteListInterface;
        SIPRegistration: SIPRegistrationInterface;
        PhoneNumbers: PhoneNumbersInterface;
        CallerIDs: CallerIDsInterface;
        OutboundTestNumbers: OutboundTestNumbersInterface;
        Queues: QueuesInterface;
        SmartQueue: SmartQueueInterface;
        Skills: SkillsInterface;
        AdminUsers: AdminUsersInterface;
        AdminRoles: AdminRolesInterface;
        AuthorizedIPs: AuthorizedIPsInterface;
        DialogflowCredentials: DialogflowCredentialsInterface;
        SMS: SMSInterface;
        RecordStorages: RecordStoragesInterface;
        RoleSystem: RoleSystemInterface;
        KeyValueStorage: KeyValueStorageInterface;
        Invoices: InvoicesInterface;
    }
    
}

declare namespace VoximplantAvatar {
  /**
   * [Avatar](/docs/references/voxengine/voximplantavatar/avatar) configuration object. Can be passed as arguments to the [VoximplantAvatar.createAvatar] method.
   */
  interface AvatarConfig {
    /**
     * Unique avatar id.
     */
    avatarId: string;
    /**
     * Optional. Set of key-value pairs to be passed to an avatar for personalization (e.g., a customer's name). Can be obtained in the avatar script via [getCustomData](/docs/references/avatarengine/getcustomdata#getcustomdata) function.
     */
    customData?: Object;
    /**
     * Optional. Whether an avatar should return detailed information on recognizing the user input (i.e. whether the **intents** are passed to [VoximplantAvatar.Events.UtteranceParsed](/docs/references/voxengine/voximplantavatar/events#utteranceparsed) in the avatar script). NOTE: starting from the text implementation the avatar always returns detailed information.
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
      callback: (event: VoximplantAvatar._Events[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [VoximplantAvatar.Events] event.
     * @param event Event class (i.e., [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded))
     * @param callback Optional. Handler function. If not specified, all handler functions are removed
     */
    removeEventListener<T extends keyof VoximplantAvatar._Events>(
      event: VoximplantAvatar.Events | T,
      callback?: (event: VoximplantAvatar._Events[T]) => any
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
     * Triggers the [AvatarState.onTimeout](/docs/references/avatarengine/avatarstate#ontimeout) callback function in the avatar scenario.
     */
    handleTimeout(): Promise<void>;

    /**
     * Transfers control to the avatar, so it starts a conversation. Should be called only after the [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded) event is triggered.
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
   * <br>
   * Add the following line to your scenario code to use the events:
   * ```
   * require(Modules.Avatar);
   * ```
   * @event
   */
  enum Events {
    /**
     * Triggered when an avatar script is loaded and ready to use.
     * @typedef _AvatarLoadedEvent
     */
    Loaded = 'AvatarEvents.Loaded',
    /**
     * Triggered when an avatar ends a conversation with a customer.
     * @typedef _AvatarFinishEvent
     */
    Finish = 'AvatarEvents.Finish',
    /**
     * Triggered when an avatar parses a customer's phrase. The recognized phrase can be used for debugging and logging recognition results if needed.
     * @typedef _AvatarUtteranceParsedEvent
     */
    UtteranceParsed = 'AvatarEvents.UtteranceParsed',
    /**
     * Triggered when an avatar is ready to reply to a customer.
     * @typedef _AvatarReplyEvent
     */
    Reply = 'AvatarEvents.Reply',
    /**
     * Triggered when an error occurs.
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
  interface _AvatarEvent {
    avatar: Avatar;
  }

  /**
   * @private
   */
  interface _AvatarLoadedEvent extends _AvatarEvent {
  }

  /**
   * @private
   */
  interface _AvatarFinishEvent extends _AvatarEvent {
    /**
     * Optional. Utterance to reply to the customer with.
     */
    utterance?: string;
    /**
     * Optional. Additional data returned from the avatar. Can be passed via the [AvatarResponseParameters.customData](/docs/references/avatarengine/avatarresponseparameters#customdata) parameter.
     */
    customData?: Object;
    /**
     * Current avatar state.
     */
    currentState: string;
    /**
     * Optional. Avatar text and voice [ChannelParameters](/docs/references/avatarengine/channelparameters).
     */
    channelParameters?: ChannelParameters;
  }

  /**
   * @private
   */
  interface _AvatarUtteranceParsedEvent extends _AvatarEvent {
    /**
     * Recognized phrase text.
     */
    text: string;
    /**
     * Most suitable intent recognized for the phrase (or 'unknown' if unclear).
     */
    intent: string;
    /**
     * Optional. Recognized phrase confidence.
     */
    confidence?: number;
    /**
     * Current avatar state.
     */
    currentState: string;
    /**
     * Number of the state visits.
     */
    readonly visitsCounter: number;
    /**
     * Number of user phrases processed in this state.
     */
    readonly utteranceCounter: number;
    /**
     * Default response to the intent from the UI.
     */
    response: string;
    /**
     * Optional. Extended information of the intent recognition results [AvatarUtteranceIntent](/docs/references/avatarengine/avatarutteranceintent).
     */
    intents?: Object[];
    /**
     * Optional.Extracted entities (both system and custom) [AvatarEntities](/docs/references/avatarengine/avatarentities).
     */
    entities?: Object;
  }

  /**
   * @private
   */
  interface _AvatarReplyEvent extends _AvatarEvent {
    /**
     * Optional. Utterance to reply to the customer with.
     */
    utterance?: string;
    /**
     * Optional. Next avatar state.
     */
    nextState?: string;
    /**
     * Current avatar state.
     */
    currentState: string;
    /**
     * Optional. Whether an avatar listens to the user after saying its utterance (or during it, if interruptions are enabled).
     */
    listen?: true;
    /**
     * Optional. Additional data returned from an avatar. Can be passed via the [AvatarResponseParameters.customData](/docs/references/avatarengine/avatarresponseparameters#customdata) parameter.
     */
    customData?: Object;
    /**
     * Optional. Time after which an avatar is ready to handle customer's interruptions (in case the avatar voices its response).
     */
    interruptableAfter?: number;
    /**
     * Optional. Whether an avatar's reply is final. If true, all other parameters except **customData** are ignored and the avatar does not process any more inputs in the current conversation.
     */
    isFinal?: boolean;
    /**
     * Optional. Number value that specifies how long an avatar listens to the user after saying its utterance (or during it, if interruptions are enabled).
     */
    listenTimeout?: number;
    /**
     * Optional. Avatar text and voice [ChannelParameters](/docs/references/avatarengine/channelparameters).
     */
    channelParameters?: ChannelParameters;
  }

  /**
   * @private
   */
  interface _AvatarErrorEvent extends _AvatarEvent {
    /**
     * Error description.
     */
    reason: string;
  }
}

declare namespace VoximplantAvatar {
  /**
   * [VoiceAvatar](/docs/references/voxengine/voximplantavatar/voiceavatar) configuration. Can be passed as arguments to the [VoximplantAvatar.createVoiceAvatar] method.
   */
  interface VoiceAvatarConfig {
    /**
     * Current call object.
     */
    call: Call;
    /**
     * Avatar configuration.
     */
    avatarConfig: VoximplantAvatar.AvatarConfig;
    /**
     * ASR parameters.
     */
    asrParameters: ASRParameters;
    /**
     * Optional. [Player](/docs/references/voxengine/player) parameters: language, progressivePlayback, volume, rate, etc.
     */
    ttsPlayerParameters: TTSPlayerParameters;
    /**
     * Optional. End of phrase timeout in milliseconds. If the ASR is running in the interim mode, we may not wait for the final response from the ASR, but instead, take the last interim, after which there are no new ones during this timeout. It allows us to reduce the time of voice recognition. This parameter should be set individually for each ASR vendor. **1000ms** is a good default value not to interrupt the user aggressively.
     */
    asrEndOfPhraseDetectorTimeout?: number;
    /**
     * Optional. ASR listen timeout in milliseconds. If there is no response from the customer, the [AvatarState.onTimeout](/docs/references/avatarengine/avatarstate#ontimeout) required callback function executes. You can override the global timeout via the [AvatarResponseParameters.listenTimeout](/docs/references/avatarengine/avatarresponseparameters#listentimeout) parameter for the current response. Default value is 10000 milliseconds (10 seconds).
     */
    defaultListenTimeout?: number;
    /**
     * Optional. Triggered when the avatar finishes talking. Returns a dictionary with the data collected during the avatar working process.
     */
    onFinishCallback?: (
      avatarFinishEvent: VoximplantAvatar._AvatarFinishEvent
    ) => void | Promise<void>;
    /**
     * Optional. Event handler that defines what happens to the call in case of internal errors of the avatar (for example, playing an error phrase or transferring the call to an agent).
     * <br>
     * NOTE: the handler ends current javascript session using the [VoxEngine.terminate] method by default.
     */
    onErrorCallback?: (
      avatarErrorEvent: VoximplantAvatar._AvatarErrorEvent
    ) => void | Promise<void>;
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
   * As arguments, it accepts: a set of configuration parameters, callback functions and the [Call]. It independently implements automation for the interaction of [Avatar] and [Call] via the [TTS] and [ASR] modules (handles the events, causes business logic and execute the callback functions).
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
      event: VoximplantAvatar.Events | ASREvents | PlayerEvents | SequencePlayerEvents | T,
      callback: (event: VoximplantAvatar._VoiceAvatarEvents[T]) => any
    ): void;

    /**
     * Removes a handler for the specified [VoximplantAvatar.Events], [ASREvents] or [PlayerEvents] event.
     * @param event Event class (i.e., [VoximplantAvatar.Events.Loaded](/docs/references/voxengine/voximplantavatar/events#loaded), [ASREvents.Stopped], [PlayerEvents.PlaybackFinished])
     * @param callback
     */
    removeEventListener<T extends keyof VoximplantAvatar._VoiceAvatarEvents>(
      event: VoximplantAvatar.Events | ASREvents | PlayerEvents | SequencePlayerEvents | T,
      callback: (event: VoximplantAvatar._VoiceAvatarEvents[T]) => any
    ): void;
  }
}

/**
 * Represents an ML-powered bot engine that allows your system to handle natural conversations with users.
 * <br>
 * Add the following line to your scenario code to use the namespace:
 * ```
 * require(Modules.Avatar);
 * ```
 */
declare namespace VoximplantAvatar {}

declare type VoxMediaUnit =
  | Call
  | Player
  | SequencePlayer
  | ASR
  | Conference
  | Recorder
  | WebSocket
  | StreamingAgent
  | OpenAI.Beta.RealtimeAPIClient

/**
 * Available audio encoding formats. Can be passed via the [SendMediaParameters.encoding] parameter. The default value is **PCM8**.
 */
declare enum WebSocketAudioEncoding {
  /**
   * Pulse-code modulation, 8kHz.
   */
  PCM8 = 'PCM8',
  /**
   * Pulse-code modulation, 8kHz.
   */
  PCM16_8KHZ = 'PCM8',
  /**
   * Pulse-code modulation, 16kHz.
   */
  PCM16 = 'PCM16',
  /**
   * Pulse-code modulation, 16kHz.
   */
  PCM16_16KHZ = 'PCM16',
  /**
   * A-law algorithm, 8kHz.
   */
  ALAW = 'ALAW',
  /**
   * μ-law algorithm, 8kHz.
   */
  ULAW = 'ULAW',
  /**
   * Codec for **audio/ogg** and **audio/opus** MIME types, 48kHz.
   */
  OPUS = 'OPUS',
}

declare enum WebSocketCloseCode {
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
 * @event
 */
declare enum WebSocketEvents {
  /**
   * Triggered when the WebSocket connection is opened. [WebSocket.onopen] is called right before any other handlers.
   * @typedef _WebSocketOpenEvent
   */
  OPEN = 'WebSocket.Open',
  /**
   * Triggered when the WebSocket connection is closed. [WebSocket.onclose] is called right before any other handlers.
   * @typedef _WebSocketCloseEvent
   */
  CLOSE = 'WebSocket.Close',
  /**
   * Triggered when a message is received by a target object. [WebSocket.onmessage] is called right before any other handlers.
   * @typedef _WebSocketMessageEvent
   */
  MESSAGE = 'WebSocket.Message',
  /**
   * Triggers when an error occurs during the WebSocket connection. [WebSocket.onerror] is called right before any other handlers.
   * @typedef _WebSocketErrorEvent
   */
  ERROR = 'WebSocket.Error',
  /**
   * Triggered when the audio stream sent by a third party through a WebSocket is started playing.
   * @typedef _WebSocketMediaStartedEvent
   */
  MEDIA_STARTED = 'WebSocket.MediaEventStarted',
  /**
   * Triggers after the end of the audio stream sent by a third party through a WebSocket (**1 second of silence**).
   * @typedef _WebSocketMediaEndedEvent
   */
  MEDIA_ENDED = 'WebSocket.MediaEventEnded',
}

/**
 * @private
 */
declare interface _WebSocketEvents {
  [WebSocketEvents.OPEN]: _WebSocketOpenEvent;
  [WebSocketEvents.CLOSE]: _WebSocketCloseEvent;
  [WebSocketEvents.MESSAGE]: _WebSocketMessageEvent;
  [WebSocketEvents.ERROR]: _WebSocketErrorEvent;
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
declare interface _WebSocketOpenEvent extends _WebSocketEvent {
}

/**
 * @private
 */
declare interface _WebSocketCloseEvent extends _WebSocketEvent {
  /**
   * WebSocket close code.
   */
  readonly code: WebSocketCloseCode;
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
declare interface _WebSocketMessageEvent extends _WebSocketEvent {
  /**
   * The data sent by the message emitter.
   */
  readonly text: string;
}

/**
 * @private
 */
declare interface _WebSocketErrorEvent extends _WebSocketEvent {
}

/**
 * @private
 */
declare interface _WebSocketMediaEvent extends _WebSocketEvent {
  /**
   * Special tag to name audio streams sent over one WebSocket connection. With it, one can send 2 audios to 2 different media units at the same time.
   */
  tag?: string;
}

/**
 * @private
 */
declare interface _WebSocketMediaStartedEvent extends _WebSocketMediaEvent {
  /**
   * Audio encoding formats.
   */
  encoding?: string;
  /**
   * Custom parameters.
   */
  customParameters?: { [key: string]: string };
}

/**
 * @private
 */
declare interface _WebSocketMediaEndedEvent extends _WebSocketMediaEvent {
  /**
   * Information about the audio stream that can be obtained after the stream stops or pauses (**1 second of silence**).
   */
  mediaInfo?: WebSocketMediaInfo;
}

/**
 * Information about the audio stream that can be obtained after the stream stops or pauses (1-sec silence).
 */
declare interface WebSocketMediaInfo {
  /**
   * Audio stream duration.
   */
  duration: number;
}

/**
 * [WebSocket] parameters. Can be passed as arguments to the [VoxEngine.createWebSocket] method.
 */
declare interface WebSocketParameters {
  /**
   * Either a single protocol string or an array of protocol strings. The default value is **chat**.
   */
  protocols: string | string[];
  /**
   * List of dictionaries with key and value fields representing headers.
   */
  headers: { name: string; value: string }[];
}

declare enum WebSocketReadyState {
  /**
   * Connection is closed or cannot be opened.
   */
  CLOSED = 'closed',
  /**
   * Connection is closing.
   */
  CLOSING = 'closing',
  /**
   * Connection is in the process.
   */
  CONNECTING = 'connecting',
  /**
   * Connection is open and ready to communicate.
   */
  OPEN = 'open',
}

/**
 * Represents a WebSocket object that provides the API for creating and managing an outgoing or incoming WebSocket connection, as well as for sending and receiving data to/from it.
 * @param url URL to connect (wss:// + domain + path)
 * @param protocols Either a single protocol string or an array of protocol strings. The default value is **chat**
 */
declare class WebSocket {
  constructor(url: string, parameters?: WebSocketParameters);

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
  onmediastarted: ((ev: _WebSocketMediaStartedEvent) => any) | null;

  /**
   * Event handler to call after the end of the audio stream.
   */
  onmediaended: ((ev: _WebSocketMediaEndedEvent) => any) | null;

  /**
   * Returns the current state of the WebSocket connection.
   */
  readonly readyState: WebSocketReadyState;

  /**
   * Returns the absolute URL of the WebSocket. For outgoing connection, it is the URL to which to connect; for incoming, it is the WebSocket session URL.
   */
  readonly url: string;

  /**
   * Returns the WebSocket's id.
   */
  id(): string;

  /**
   * Closes the WebSocket connection or connection attempt.
   */
  close(): void;

  /**
   * Enqueues the specified data to be transmitted over the WebSocket connection.
   * @param data Data to send through a [WebSocket]
   */
  send(data: string): void;

  /**
   * Adds a handler for the specified [WebSocketEvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [WebSocketEvents.OPEN])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _WebSocketEvents>(
    event: WebSocketEvents | T,
    callback: (event: _WebSocketEvents[T]) => any,
  ): void;

  /**
   * Removes a handler for the specified [WebSocketEvents] event.
   * @param event Event class (i.e., [WebSocketEvents.OPEN])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _WebSocketEvents>(
    event: WebSocketEvents | T,
    callback?: (event: _WebSocketEvents[T]) => any,
  ): void;

  /**
   * Starts sending media from the websocket to the media unit. WebSocket works in real time and the recommended duration of one audio chunk is **20** milliseconds.
   * @param mediaUnit Media unit that receives media
   * @param parameters Optional. WebSocket interaction only parameters
   */
  sendMediaTo(mediaUnit: VoxMediaUnit, parameters?: SendMediaParameters): void;

  /**
   * Stops sending media from the websocket to the media unit.
   * @param mediaUnit Media unit that stops receiving media
   */
  stopMediaTo(mediaUnit: VoxMediaUnit): void;
}

declare module ASRModelList {
  /**
   * List of Amazon ASR models.
   * <br>
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
 * <br>
 * Add the following line to your scenario code to use the namespace:
 * ```
 * require(Modules.ASR);
 * ```
 * @namespace
 */
declare module ASRModelList {}

declare module ASRModelList {
  /**
   * List of Deepgram ASR models.
   * <br>
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
   * List of Google ASR models. The **enhanced** models cost more than the standard rate.
   * <br>
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
   * List of Microsoft ASR models.
   * <br>
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
   * List of SaluteSpeech ASR models.
   * <br>
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
   * List of T-Bank ASR models.
   * <br>
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum TBank {
    /**
     * Best for audio that originated from a phone call (typically recorded at a 8khz sampling rate).
     * @const
     */
    default,
  }
}

declare module ASRModelList {
  /**
   * List of Yandex ASR models.
   * <br>
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
     * Month names, cardinal and ordinal numbers.
     * <br>
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     * @deprecated
     */
    dates,
    /**
     * People's first and last names, as well as requests to put someone on the phone.
     * <br>
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     * @deprecated
     */
    names,
    /**
     * Addresses, organizations, and geographical features.
     * @const
     * @deprecated
     */
    maps,
    /**
     * Cardinal numbers and delimiters (comma, period).
     * <br>
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     * @deprecated
     */
    numbers,
  }
}

declare module ASRModelList {
  /**
   * List of YandexV3 ASR models.
   * <br>
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
     * Month names, cardinal and ordinal numbers.
     * <br>
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     * @deprecated
     */
    dates,
    /**
     * People's first and last names, as well as requests to put someone on the phone.
     * <br>
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     * @deprecated
     */
    names,
    /**
     * Addresses, organizations, and geographical features.
     * @const
     * @deprecated
     */
    maps,
    /**
     * Cardinal numbers and delimiters (comma, period).
     * <br>
     * Supported by [ASRProfileList.Yandex.ru_RU] only.
     * @const
     * @deprecated
     */
    numbers,
  }
}

/**
 * [ASR] parameters. Can be passed as arguments to the [VoxEngine.createASR] method.
 * <br>
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
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, T-Bank, Yandex, YandexV3.*
   */
  profile:
    | ASRProfileList.Amazon
    | ASRProfileList.Deepgram
    | ASRProfileList.Google
    | ASRProfileList.Microsoft
    | ASRProfileList.SaluteSpeech
    | ASRProfileList.TBank
    | ASRProfileList.Yandex
    | ASRProfileList.YandexV3;

  /**
   * Optional. Recognition model. Select the model best suited to your domain to get the best results. If it is not specified, the **default** model is used.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, T-Bank, Yandex, YandexV3.*
   */
  model?:
    | ASRModelList.Amazon
    | ASRModelList.Deepgram
    | ASRModelList.Google
    | ASRModelList.Microsoft
    | ASRModelList.SaluteSpeech
    | ASRModelList.TBank
    | ASRModelList.Yandex
    | ASRModelList.YandexV3;

  /**
   * Optional. Whether to enable interim ASR results. If set to **true**, the [ASREvents.InterimResult] triggers many times according to the speech.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, SaluteSpeech, T-Bank, Yandex.*
   */
  interimResults?: boolean;

  /**
   * Optional. Whether to enable single utterance. The default value is **false**, so:
   * <br>
   * 1) if the speech is shorter than 60 sec, [ASREvents.Result] is triggered in unpredictable time. You could mute the mic when the speech is over - this increases the probability of [ASREvents.Result] catching;
   * <br>
   * 2) if the speech is longer than 60 sec, [ASREvents.Result] is triggered each 60 seconds.
   * <br>
   * If it is **true**, the [ASREvents.Result] is triggered after every utterance.
   * <br>
   * <br>
   * *Available for providers: Amazon, Google, Microsoft, SaluteSpeech, T-Bank, Yandex.*
   * <br>
   * *Note: for the SaluteSpeech provider the default value is **true**.*
   */
  singleUtterance?: boolean;

  /**
   * Optional. Preferable words to recognize. Note that **phraseHints** do not limit the recognition to the specific list. Instead, words in the specified list has a higher chance to be selected.
   * <br>
   * <br>
   * *Available for providers: Google.*
   */
  phraseHints?: string[];

  /**
   * Optional. Whether to enable profanity filter. The default value is **false**.
   * <br>
   * If set to **true**, the server attempts to filter out profanities, replacing all but the initial character in each filtered word with asterisks, e.g. "f***". If set to **false** or omitted, profanities are not filtered out.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, T-Bank, Yandex, YandexV3.*
   */
  profanityFilter?: boolean;

  /**
   * Optional. Request headers: {'x-data-logging-enabled': true}.
   * <br>
   * <br>
   * *Available for providers: Amazon, Deepgram, Google, Microsoft, SaluteSpeech, T-Bank, Yandex, YandexV3.*
   */
  headers?: { [key: string]: any };

  /**
   * Optional. Whether to use the Google [v1p1beta1 Speech API](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech), e.g., **enableSeparateRecognitionPerChannel**, **alternativeLanguageCodes**, **enableWordTimeOffsets**, etc.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  beta?: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. The recognition result contains a [_ASRResultEvent.channelTag] field to state which channel that result belongs to. If set to **false** or omitted, only the first channel is recognized.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableSeparateRecognitionPerChannel?: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. A list of up to 3 additional BCP-47 language tags, listing possible alternative languages of the supplied audio. See [Language Support](https://cloud.google.com/speech-to-text/docs/languages) for a list of the currently supported language codes.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  alternativeLanguageCodes?: string[];

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. If set to **true**, the top result includes a list of words and the start and end time offsets (timestamps) for those words. If set to **false** or omitted, no word-level time offset information is returned. The default value is **false**.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableWordTimeOffsets?: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. If set to **true**, the top result includes a list of words and the confidence for those words. If set to **false** or omitted, no word-level confidence information is returned. The default value is **false**.
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableWordConfidence?: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. If set to **true**, adds punctuation to recognition result hypotheses. This feature is only available in select languages. Setting this for requests in other languages has no effect at all. The **false** value does not add punctuation to result hypotheses. The default value is **false**.
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableAutomaticPunctuation?: boolean;

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. Config to enable speaker diarization and set additional parameters to make diarization better suited for your application.
   * <br>
   * See the full list of available fields [here](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#SpeakerDiarizationConfig).
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  diarizationConfig?: {
    /**
     * If set to **true**, enables speaker detection for each recognized word in the top alternative of the recognition result.
     */
    enableSpeakerDiarization: boolean;
  };

  /**
   * v1p1beta1 Speech API feature.
   * <br>
   * Optional. Metadata regarding this request.
   * <br>
   * See the full list of available fields [here](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#RecognitionMetadata).
   * <br>
   * Requires the **beta** parameter set to **true**.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  metadata?: {
    /**
     * The audio type that most closely describes the audio being recognized. Possible values are: **MICROPHONE_DISTANCE_UNSPECIFIED**, **NEARFIELD**, **MIDFIELD**, **FARFIELD**.
     */
    microphoneDistance: string;
  };

  /**
   * Optional. Increase the recognition model bias by assigning more weight to some phrases than others. **Phrases** is the word array, **boost** is the weight in the range of 1..20.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  speechContexts?: [
    {
      phrases: string[];
      boost: number;
    }
  ];

  /**
   * Optional. Maximum number of recognition hypotheses to be returned.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  maxAlternatives?: number;

  /**
   * Optional. Speech adaptation configuration.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  adaptation?: Object;

  /**
   * Optional. Whether to enable the spoken punctuation behavior for the call.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableSpokenPunctuation?: boolean;

  /**
   * Optional. Whether to enable the spoken emoji behavior for the call.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  enableSpokenEmojis?: boolean;

  /**
   * Optional. Whether to use the enhanced models for speech recognition.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  useEnhanced?: boolean;

  /**
   * Optional. Transcription normalization configuration. Use transcription normalization to automatically replace parts of the transcript with phrases of your choosing.
   * <br>
   * <br>
   * *Available for providers: Google.*
   * @beta
   */
  transcriptNormalization?: {
    entries: [
      {
        search: string;
        replace: string;
        caseSensitive: boolean;
      }
    ];
  };

  /**
   * Optional. Provide the ASR parameters directly to the provider in this parameter. Find more information in the <a href="/docs/guides/speech/stt#passing-parameters-directly-to-the-provider"> documentation</a>.
   * <br>
   * <br>
   * *Available for providers: Deepgram, Google, SaluteSpeech, T-Bank, Yandex, YandexV3.*
   */
  request?: Object;
}

declare module ASRProfileList {
  /**
   * List of Amazon ASR profiles.
   * <br>
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
 * <br>
 * Add the following line to your scenario code to use the namespace:
 * ```
 * require(Modules.ASR);
 * ```
 * @namespace
 */
declare module ASRProfileList {}

declare module ASRProfileList {
  /**
   * List of Deepgram ASR profiles.
   * <br>
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
    es_419,
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
   * List of Google ASR profiles.
   * <br>
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
     * Chinese (Simplified, China)
     * @const
     */
    cmn_Hans_CN,

    /**
     * Chinese (Simplified, Hong Kong)
     * @const
     */
    cmn_Hans_HK,

    /**
     * Chinese (Traditional, Taiwan)
     * @const
     */
    cmn_Hant_TW,

    /**
     * Chinese, Cantonese (Traditional Hong Kong)
     * @const
     */
    yue_Hant_HK,

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
     * Kinyarwanda (Rwanda)
     * @const
     */
    rw_RW,

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
     * Swati (Latin, South Africa)
     * @const
     */
    ss_Latn_ZA,

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
     * Tsonga (South Africa)
     * @const
     */
    ts_ZA,

    /**
     * Tswana (Latin, South Africa)
     * @const
     */
    tn_Latn_ZA,

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
     * Xhosa (South Africa)
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
   * List of Microsoft ASR profiles.
   * <br>
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
     * Arabic (Palestinian Authority)
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
     * Catalan
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
     * Norwegian Bokmål (Norway)
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
     * Punjabi (India)
     * @const
     */
    pa_IN,

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
     * Kiswahili (Kenya)
     * @const
     */
    sw_KE,

    /**
     * Kiswahili (Tanzania)
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
     * Turkish (Türkiye)
     * @const
     */
    tr_TR,

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
     * Chinese (Jilu Mandarin, Simplified)
     * @const
     */
    zh_CN_shandong,

    /**
     * Chinese (Southwestern Mandarin, Simplified)
     * @const
     */
    zh_CN_sichuan,

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
     * isiZulu (South Africa)
     * @const
     */
    zu_ZA,
  }
}

declare module ASRProfileList {
  /**
   * List of SaluteSpeech ASR profiles.
   * <br>
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
   * List of T-Bank ASR profiles.
   * <br>
   * Add the following line to your scenario code to use the enum:
   * ```
   * require(Modules.ASR);
   * ```
   */
  enum TBank {
    /**
     * Russian (Russia)
     * @const
     */
    ru_RU,
  }
}

declare module ASRProfileList {
  /**
   * List of Yandex ASR profiles.
   * <br>
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
     * Hebrew (Israel)
     * @const
     */
    he_HE,
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
   * List of YandexV3 ASR profiles.
   * <br>
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
     * Hebrew (Israel)
     * @const
     */
    he_HE,
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
 * Represents an ASR object provides speech recognition capabilities. Audio stream can be sent to an ASR instance from [Call], [Player] or [Conference] objects. Parameters **language** or **dictionary** should be passed to the [VoxEngine.createASR] function.
 * <br>
 * Add the following line to your scenario code to use the class:
 * ```
 * require(Modules.ASR);
 * ```
 */
declare class ASR {
  /**
   * @param id
   * @param language
   * @param dictionary
   */
  constructor(id: string, language: string, dictionary: string);

  /**
   * Returns the asr's id.
   */
  id(): string;

  /**
   * Returns the asr's language.
   */
  language(): string;

  /**
   * Returns the asr's dictionary.
   */
  dictionary(): string[];

  /**
   * Adds a handler for the specified [ASREvents] event. Use only functions as handlers; anything except a function leads to the error and scenario termination when a handler is called.
   * @param event Event class (i.e., [ASREvents.Stopped])
   * @param callback Handler function. A single parameter is passed - object with event information
   */
  addEventListener<T extends keyof _ASREvents>(
    event: ASREvents | T,
    callback: (event: _ASREvents[T]) => any
  ): void;

  /**
   * Removes a handler for the specified [ASREvents] event.
   * @param event Event class (i.e., [ASREvents.Stopped])
   * @param callback Optional. Handler function. If not specified, all handler functions are removed
   */
  removeEventListener<T extends keyof _ASREvents>(
    event: ASREvents | T,
    callback?: (event: _ASREvents[T]) => any
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
 * @param encoding Encoding to use for string creation, the default value is **utf-8**.
 */
declare function bytes2str(data: number[], encoding: string): string;

/**
 * Avatar text and voice channel parameters. Can be passed via the [AvatarResponseParameters.channelParameters](/docs/references/avatarengine/avatarresponseparameters#channelparameters) parameter.
 */
declare interface ChannelParameters {
  /**
   * Optional. Avatar voice channel parameters
   */
  voice?: VoiceChannelParameters;
  /**
   * Optional. Avatar text channel parameters
   */
  text?: TextChannelParameters;
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
 * Converts the date to the specified local timezone. Note that `new Date()` always returns time in the UTC+0 timezone.
 * @param timezone Local timezone in the AREA/LOCATION format of the [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
 * @param date Instance of the `Date` object.
 */
declare function getLocalTime(timezone: string, date: Date): Date;

/**
 * Creates an array of numbers from parsing a hex string
 * @param data Hex string like "cafec0de"
 */
declare function hex2bytes(data: string): number[];

/**
 * Count the number of deletions, insertions, or substitutions required to transform str1 into str2. The number shows a measure of the similarity between two strings. It is also known as edit distance.
 * @param str1 First string
 * @param str2 Second string
 */
declare function levenshtein_distance(str1: string, str2: string): number;

declare namespace Logger {
}

declare namespace Logger {
  /**
   * Writes a specified message to the session logger. Logs are stored in the [call history](https://manage.voximplant.com/calls).
   * @param message Message to write. Maximum length is 15000 characters
   */
  function write(message: string): void;
}

declare module Net {
  /**
   * Advanced HTTP request options.
   */
  interface HttpRequestOptions {
    /**
     * HTTP request type as a string: **GET**, **POST** etc. The default value is **GET**.
     */
    method?: string;
    /**
     * Optional. Raw UTF-8 encoded data string or an array of bytes in any encoding generated by [str2bytes](/docs/references/voxengine/str2bytes) to send as the HTTP request body when 'method' is set to **POST**, **PUT**, or **PATCH**.
     */
    postData?: string | number[];
    /**
     * Optional. Request headers: {'Content-Type': 'text/html; charset=utf-8', 'User-Agent': 'YourCustomUserAgent/1.0'}. Note that the default value for the 'User-Agent' header is **VoxEngine/1.0**.
     */
    headers?: { [key: string]: string };
    /**
     * Optional. Request parameters. They can be specified in the URL itself as well.
     */
    params?: {
      [key: string]: string;
    };
    /**
     * Optional. Whether [HttpRequestResult.data](/docs/references/voxengine/net/httprequestresult#data) should contain a list of 1-byte numbers corresponding to the HTTP response data. If set to **false**, [HttpRequestResult.data](/docs/references/voxengine/net/httprequestresult#data) is undefined.
     */
    rawOutput?: boolean;
    /**
     * Optional. Timeout for getting a response to the request in seconds. The default value is **90**. The value can be only decreased.
     */
    timeout?: number;
    /**
     * Optional. Timeout for the TCP connection to the address in seconds. The default value is **6**. The value can be only decreased.
     */
    connectionTimeout?: number;
    /**
     * Optional. Whether to enable logging the POST request body. The default value is **false**.
     */
    enableSystemLog?: boolean;
  }
}

declare module Net {
  /**
   * HTTP response.
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
     * If [HttpRequestOptions.rawOutput](/docs/references/voxengine/net/httprequestoptions#rawoutput) is true, data contains a list of 1-byte numbers corresponding to HTTP response data. If [HttpRequestOptions.rawOutput](/docs/references/voxengine/net/httprequestoptions#rawoutput) is false, data is undefined.
     */
    data?: number[];
    /**
     * In case of an error contains the error description
     */
    error?: string;
  }
}

declare module Net {}

/**
 * Avatar voice channel playback parameters. Can be passed via the [VoiceChannelParameters.playback] parameter.
 */
declare type PlaybackParameters = TTSPlaybackParameters | URLPlaybackParameters | SequencePlaybackParameters;

/**
 * Can be passed via the [RichContentButtonItem.action] parameter.
 */
declare interface RichContentButtonAction {
  /**
   * Rich content type.
   */
  type: 'text' | 'location' | 'camera' | 'camera_roll' | 'phone_call' | 'contact' | 'uri';
  /**
   * Optional. Used for the "uri" type only.
   */
  uri?: string;
}

/**
 * Can be passed via the [RichContentButtons.items] parameter.
 */
declare interface RichContentButtonItem {
  /**
   * Rich content button text.
   */
  text: string;
  /**
   * Rich content button action.
   */
  action: RichContentButtonAction;
  /**
   * Message to the avatar when the button is clicked.
   */
  payload?: any;
}

/**
 * Can be passed via the [RichContent.buttons] parameter.
 */
declare interface RichContentButtons {
  /**
   * Rich content button text.
   */
  text: string;
  /**
   * Rich content button items.
   */
  items: RichContentButtonItem[];
}

/*
 * Can be passed via the [RichContent.contact] parameter.
 */
declare interface RichContentContact {
  name: string;
  number: string;
  avatar?: string;
}

/**
 * Can be passed via the [RichContent.externalLink] parameter.
 */
declare interface RichContentExternalLink {
  /**
   * Link's text.
   */
  caption: string;
  /**
   * Link's URL address.
   */
  url: string;
}

/**
 * Can be passed via the [RichContent.image] or [RichContent.file] parameter.
 */
declare interface RichContentFile {
  /**
   * URL to the image/file location.
   */
  url: string;
  /**
   * Caption for the image/file.
   */
  caption: string;
  /**
   * File name.
   */
  fileName: string;
  /**
   * File size.
   */
  fileSize: number;
  /**
   * Content type.
   */
  contentType: string;
}

/**
 * Can be passed via the [RichContent.location] parameter.
 */
declare interface RichContentLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Can be passed via the [RichContent.video] or [RichContent.audio] parameter.
 */
declare interface RichContentMedia extends RichContentFile {
  duration: number;
}

/**
 * Can be passed via the [TextChannelParameters.richContent] parameter.
 */
declare interface RichContent {
  /**
   * Button for the rich content response.
   */
  buttons?: RichContentButtons;
  /**
   * Location for the rich content response.
   */
  location?: RichContentLocation;
  /**
   * Image for the rich content response.
   */
  image?: RichContentFile;
  /**
   * File for the rich content response.
   */
  file?: RichContentFile;
  /**
   * Video for the rich content response.
   */
  video?: RichContentMedia;
  /**
   * Audio for the rich content response.
   */
  audio?: RichContentMedia;
  /**
   * Link for the rich content response.
   */
  externalLink?: RichContentExternalLink;
  /**
   * Contact data for the rich content response.
   */
  contact?: RichContentContact;
  /**
   * Text string for the rich content response.
   */
  text?: string;
}

/**
 * Avatar voice channel sequence playback parameters. Can be passed via the [VoiceChannelParameters.playback] parameter.
 */
declare interface SequencePlaybackParameters {
  /**
   * Array of the segments.
   */
  segments: SequencePlaybackSegment[];
}

/**
 * Sequence of the voice channel TTS and URL playback segments. Can be passed via the [SequencePlaybackParameters.segments] parameter.
 */
declare type SequencePlaybackSegment = TTSPlaybackParameters | URLPlaybackParameters;

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
 * Creates an array of numbers from parsing string in specified codepage
 * @param data String to parse
 * @param encoding String encoding, the default value is **utf-8**.
 */
declare function str2bytes(data: string, encoding: string): number[];

/**
 * Avatar text channel parameters. Can be passed via the [ChannelParameters.text] parameter.
 */
declare interface TextChannelParameters {
  /**
   * Response of the rich content type.
   */
  richContent: RichContent;
}

/**
 * List of available audio effect (profiles that are applied on post synthesized text to speech) for the [TTSOptions.effectsProfileId] parameter.
 */
declare enum TTSEffectsProfile {
  /**
   * Smartwatches and other wearables, like Apple Watch, Wear OS watch
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

/**
 * Text-to-speech options. Can be passed via the [CallSayParameters.ttsOptions] and [TTSPlayerParameters.ttsOptions] parameter. See the details in the <a href="//www.w3.org/TR/speech-synthesis/#S3.2.4">official specs</a>.
 * <br>
 * Alternatively, you can pass the speech synthesis parameters to your TTS provider directly in the [request](https://voximplant.com/docs/references/voxengine/ttsplayerparameters#request) parameter in the JSON format.
 * Read more about passing the parameters directly in the [Speech synthesis](https://voximplant.com/docs/guides/speech/tts#passing-parameters-directly-to-the-provider) guide.
 */
declare interface TTSOptions {
  /**
   * Optional. Voice sentiment. For Yandex voices, works only for <a href="/docs/references/voxengine/voicelist/yandex/neural">ru_RU voices</a>.
   * <br>
   * <br>
   * *Available for providers: Yandex.*
   */
  emotion?: string;
  /**
   * Optional. Voice pitch. Acceptable ranges: 1) the numbers followed by "Hz" from 0.5Hz to 2Hz  2) x-low, low, medium, high, x-high, default.
   * <br>
   * <br>
   * *Available for providers: Google.*
   */
  pitch?: string;
  /**
   * Optional. Speech speed. Possible values are x-slow, slow, medium, fast, x-fast, default.
   * <br>
   * <br>
   * *Available for providers: Google, Yandex.*
   */
  rate?: string;
  /**
   * Optional. Speech volume. Possible values are silent, x-soft, soft, medium, loud, x-loud, default.
   * <br>
   * <br>
   * *Available for providers: Google.*
   */
  volume?: string;
  /**
   * Optional. Speech speed. Possible values are from "0.1" to "3.0".
   * <br>
   * <br>
   * *Available for providers: Yandex.*
   */
  speed?: string;
  /**
   * Optional. An identifier which selects 'audio effects' profiles that are applied on (post synthesized) text to speech. Effects are applied additionally to each other in the order they are provided.
   * <br>
   * <br>
   * *Available for providers: Google.*
   */
  effectsProfileId?: TTSEffectsProfile[];
  /**
   * Optional. If you have a custom Yandex engine voice, specify it in this field. Please contact support to activate this feature for your account.
   * <br>
   * <br>
   * *Available for providers: Yandex.*
   */
  yandexCustomModelName?: string;
}

/**
 * Avatar voice channel TTS playback parameters. Can be passed via the [VoiceChannelParameters.playback] parameter.
 * <br>
 * Has a similar interface to [URLPlayerSegment].
 */
declare interface TTSPlaybackParameters {
  /**
   * Text to synthesize.
   * <br>
   * NOTE: this parameter is required for the [AvatarState] (not for the [AvatarFormState]), so if you want to use the value from the [VoximplantAvatar.Events.Reply](/docs/references/voxengine/voximplantavatar/events#reply) event's **utterance** parameter, specify it into the **text** parameter.
   */
  text: string;
  /**
   * Whether to enable the playback interruption.
   * <br>
   * NOTE: the segment with **allowPlaybackInterruption** parameter should be always followed by another segment eligible for playback interruption or should be the last segment.
   */
  allowPlaybackInterruption: true;
  /**
   * Optional. TTS [Player](/docs/references/voxengine/player) parameters.
   * <br>
   * NOTE: the default value is inherited from the [VoiceAvatarConfig.ttsPlayerOptions](/docs/references/voxengine/voximplantavatar/voiceavatarconfig) parameter.
   */
  parameters?: TTSPlayerParameters;
}

/**
 * TTS [Player] parameters. Can be passed as arguments to the [VoxEngine.createTTSPlayer] method.
 */
declare interface TTSPlayerParameters {
  /**
   * Optional. Language and voice for TTS. List of all supported voices: [VoiceList]. The default value is **VoiceList.Amazon.en_US_Joanna**.
   * <br>
   * <br>
   * *Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank,Yandex.*
   */
  language?: Voice;
  /**
   * Optional. Whether to use progressive playback. If **true**, the generated speech is delivered in chunks which reduces delay before a method call and playback. The default value is **false**.
   * <br>
   * <br>
   * *Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank,Yandex.*
   */
  progressivePlayback?: boolean;
  /**
   * Optional. Parameters for TTS. Note that support of the [TTSOptions.pitch] parameter depends on the language and dictionary used. For unsupported combinations the [CallEvents.PlaybackFinished] event is triggered with error 400.
   * <br>
   * <br>
   * *Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank,Yandex.*
   */
  ttsOptions?: TTSOptions;
  /**
   * Optional. Whether the player is on pause after creation. To continue the playback, use the [Player.resume] method. The default value is **false**.
   * <br>
   * <br>
   * *Available for providers: Amazon, Google, IBM, Microsoft, SaluteSpeech, T-Bank,Yandex, YandexV3.*
   */
  onPause?: boolean;
  /**
   * Optional. Provide the TTS parameters directly to the provider in this parameter. Find more information in the <a href="/docs/guides/speech/tts#passing-parameters-directly-to-the-provider"> documentation</a>.
   * <br>
   * <br>
   * *Available for providers: Google, SaluteSpeech, T-Bank,YandexV3.*
   */
  request?: Object;
}

/**
 * Avatar voice channel URL playback parameters. Can be passed via the [VoiceChannelParameters.playback] parameter.
 * <br>
 * Has a similar interface to [URLPlayerSegment](/docs/references/voxengine/urlplayersegment).
 */
declare interface URLPlaybackParameters {
  /**
   * Url of an audio file. Supported formats are: **mp3**, **ogg**, **flac**, and **wav** (**mp3**, **speex**, **vorbis**, **flac**, and **wav** codecs respectively). Maximum file size is **10 Mb**.
   */
  url: string;
  /**
   * Optional. Whether to enable the playback interruption. The default value is **false**.
   * <br>
   * NOTE: the segment with 'allowPlaybackInterruption' parameter should be always followed by another segment eligible for playback interruption or should be the last segment.
   */
  allowPlaybackInterruption: boolean;
  /**
   * Optional. URL [Player](/docs/references/voxengine/player) parameters.
   * <br>
   * Same as [URLPlayerParameters](/docs/references/voxengine/urlplayerparameters).
   */
  parameters?: URLPlayerParameters;
}

/**
 * URL [Player] parameters. Can be passed as arguments to the [VoxEngine.createURLPlayer] method.
 */
declare interface URLPlayerParameters {
  /**
   * Optional. Whether to loop playback.
   */
  loop?: boolean;
  /**
   * Optional. Whether the player is on pause after creation. To continue the playback, use the [Player.resume] method. The default value is **false**.
   */
  onPause?: boolean;
  /**
   * Optional. Whether to use progressive playback. If true, the file is delivered in chunks which reduces delay before a method call and playback. The default value is **false**.
   */
  progressivePlayback?: boolean;
  /**
   * Optional. Whether to hide the HTTP request headers from the session logs. The default value is **false**.
   */
  hideHeaders?: boolean;
  /**
   * Optional. Whether to hide the HTTP request body from the session logs. The default value is **false**.
   */
  hideBody?: boolean;
}

/**
 * The [URLPlayerRequest] body. Should contain either ‘text’ or ‘binary’ keys.
 */
declare interface URLPlayerRequestBody {
  /**
   * Stringify object of the **'{"key":"value"}'** type.
   */
  text?: string;
  /**
   * Base64 string.
   */
  binary?: string;
}


/**
 * The [URLPlayerRequest] header.
 */
declare interface URLPlayerRequestHeader {
  /**
   * HTTP request header name.
   */
  name: string;
  /**
     * HTTP request header value.
   */
  value: string;
}

/**
 * The [URLPlayerRequest] method.
 */
declare enum URLPlayerRequestMethod {
  /**
   * The **GET** HTTP method.
   */
  GET = 'GET',
  /**
   * The **POST** HTTP method.
   */
  POST = 'POST',
}

/**
 * The URL [Player] request.
 */
declare interface URLPlayerRequest {
  /**
   * HTTP request url of an audio file. Supported formats are: **mp3**, **ogg**, **flac**, and **wav** (**mp3**, **speex**, **vorbis**, **flac**, and **wav** codecs respectively). Maximum file size is **10 Mb**.
   */
  url: string;
  /**
   * Optional. HTTP request method. The default value is **GET**.
   */
  method?: URLPlayerRequestMethod;
  /**
   * Optional. HTTP request headers.
   */
  headers?: URLPlayerRequestHeader[];
  /**
   * Optional. HTTP request body.
   */
  body?: URLPlayerRequestBody;
}

/**
 * Generates unique identifier and returns it is string representation.
 */
declare function uuidgen(): string;

/**
 * Avatar voice channel parameters. Can be passed via the [ChannelParameters.voice](/docs/references/avatarengine/channelparameters#voice) parameter.
 */
declare interface VoiceChannelParameters {
  /**
   * Optional. [ASR](/docs/references/voxengine/asr) parameters.
   * <br>
   * NOTE: the default value is inherited from the [VoiceAvatarConfig.asrParameters](/docs/references/voxengine/voximplantavatar/voiceavatarconfig#asrparameters) parameter.
   */
  asr?: ASRParameters;
  /**
   * Avatar voice channel playback parameters.
   * <br>
   * NOTE: the default value is inherited from the [VoiceAvatarConfig.ttsPlayerOptions](/docs/references/voxengine/voximplantavatar/voiceavatarconfig#ttsplayeroptions) parameter.
   */
  playback?: PlaybackParameters;
}

declare namespace VoiceList {
  /**
   * List of available Amazon TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Amazon {
    /**
     * Amazon voice, Turkish Female, Filiz.
     * @const
     */
    const tr_TR_Filiz: Voice;
    /**
     * Amazon voice, Swedish Female, Astrid.
     * @const
     */
    const sv_SE_Astrid: Voice;
    /**
     * Amazon voice, Russian Female, Tatyana.
     * @const
     */
    const ru_RU_Tatyana: Voice;
    /**
     * Amazon voice, Russian Male, Maxim.
     * @const
     */
    const ru_RU_Maxim: Voice;
    /**
     * Amazon voice, Romanian Female, Carmen.
     * @const
     */
    const ro_RO_Carmen: Voice;
    /**
     * Amazon voice, Portuguese Female, Inês.
     * @const
     */
    const pt_PT_Ines: Voice;
    /**
     * Amazon voice, Portuguese Male, Cristiano.
     * @const
     */
    const pt_PT_Cristiano: Voice;
    /**
     * Amazon voice, Brazilian Portuguese Female, Vitória.
     * @const
     */
    const pt_BR_Vitoria: Voice;
    /**
     * Amazon voice, Brazilian Portuguese Male, Ricardo.
     * @const
     */
    const pt_BR_Ricardo: Voice;
    /**
     * Amazon voice, Brazilian Portuguese Female (second voice), Camila.
     * @const
     */
    const pt_BR_Camila: Voice;
    /**
     * Amazon voice, Polish Female, Maja.
     * @const
     */
    const pl_PL_Maja: Voice;
    /**
     * Amazon voice, Polish Male, Jan.
     * @const
     */
    const pl_PL_Jan: Voice;
    /**
     * Amazon voice, Polish Male (second voice), Jacek.
     * @const
     */
    const pl_PL_Jacek: Voice;
    /**
     * Amazon voice, Polish Female (second voice), Ewa.
     * @const
     */
    const pl_PL_Ewa: Voice;
    /**
     * Amazon voice, Dutch Male, Ruben.
     * @const
     */
    const nl_NL_Ruben: Voice;
    /**
     * Amazon voice, Dutch Female, Lotte.
     * @const
     */
    const nl_NL_Lotte: Voice;
    /**
     * Amazon voice, Norwegian Female, Liv.
     * @const
     */
    const nb_NO_Liv: Voice;
    /**
     * Amazon voice, Korean Female, Seoyeon.
     * @const
     */
    const ko_KR_Seoyeon: Voice;
    /**
     * Amazon voice, Japanese Male, Takumi.
     * @const
     */
    const ja_JP_Takumi: Voice;
    /**
     * Amazon voice, Japanese Female, Mizuki.
     * @const
     */
    const ja_JP_Mizuki: Voice;
    /**
     * Amazon voice, Italian Female, Bianca.
     * @const
     */
    const it_IT_Bianca: Voice;
    /**
     * Amazon voice, Italian Male, Giorgio.
     * @const
     */
    const it_IT_Giorgio: Voice;
    /**
     * Amazon voice, Italian Female (second voice), Carla.
     * @const
     */
    const it_IT_Carla: Voice;
    /**
     * Amazon voice, Icelandic Male, Karl.
     * @const
     */
    const is_IS_Karl: Voice;
    /**
     * Amazon voice, Icelandic Female, Dóra.
     * @const
     */
    const is_IS_Dora: Voice;
    /**
     * Amazon voice, French Male, Mathieu.
     * @const
     */
    const fr_FR_Mathieu: Voice;
    /**
     * Amazon voice, French Female, Léa.
     * @const
     */
    const fr_FR_Lea: Voice;
    /**
     * Amazon voice, French Female (second voice), Céline.
     * @const
     */
    const fr_FR_Celine: Voice;
    /**
     * Amazon voice, Canadian French Female, Chantal.
     * @const
     */
    const fr_CA_Chantal: Voice;
    /**
     * Amazon voice, US Spanish Female, Penélope.
     * @const
     */
    const es_US_Penelope: Voice;
    /**
     * Amazon voice, US Spanish Male, Miguel.
     * @const
     */
    const es_US_Miguel: Voice;
    /**
     * Amazon voice, US Spanish Female (second voice), Lupe.
     * @const
     */
    const es_US_Lupe: Voice;
    /**
     * Amazon voice, Mexican Spanish Female, Mia.
     * @const
     */
    const es_MX_Mia: Voice;
    /**
     * Amazon voice, Castilian Spanish Female, Lucia.
     * @const
     */
    const es_ES_Lucia: Voice;
    /**
     * Amazon voice, Castilian Spanish Male, Enrique.
     * @const
     */
    const es_ES_Enrique: Voice;
    /**
     * Amazon voice, Castilian Spanish Female (second voice), Conchita.
     * @const
     */
    const es_ES_Conchita: Voice;
    /**
     * Amazon voice, Welsh English Male, Geraint.
     * @const
     */
    const en_GB_WLS_Geraint: Voice;
    /**
     * Amazon voice, US English Female, Salli.
     * @const
     */
    const en_US_Salli: Voice;
    /**
     * Amazon voice, US English Male, Matthew.
     * @const
     */
    const en_US_Matthew: Voice;
    /**
     * Amazon voice, US English Female (second voice), Kimberly.
     * @const
     */
    const en_US_Kimberly: Voice;
    /**
     * Amazon voice, US English Female (third voice), Kendra.
     * @const
     */
    const en_US_Kendra: Voice;
    /**
     * Amazon voice, US English Male (second voice), Justin.
     * @const
     */
    const en_US_Justin: Voice;
    /**
     * Amazon voice, US English Male (third voice), Joey.
     * @const
     */
    const en_US_Joey: Voice;
    /**
     * Amazon voice, US English Female (fourth voice), Joanna.
     * @const
     */
    const en_US_Joanna: Voice;
    /**
     * Amazon voice, US English Female (fifth voice), Ivy.
     * @const
     */
    const en_US_Ivy: Voice;
    /**
     * Amazon voice, Indian English Female, Raveena.
     * @const
     */
    const en_IN_Raveena: Voice;
    /**
     * Amazon voice, Indian English Female (second voice), Aditi.
     * @const
     */
    const en_IN_Aditi: Voice;
    /**
     * Amazon voice, British English Female, Emma.
     * @const
     */
    const en_GB_Emma: Voice;
    /**
     * Amazon voice, British English Male, Brian.
     * @const
     */
    const en_GB_Brian: Voice;
    /**
     * Amazon voice, British English Female (second voice), Amy.
     * @const
     */
    const en_GB_Amy: Voice;
    /**
     * Amazon voice, Australian English Male, Russell.
     * @const
     */
    const en_AU_Russell: Voice;
    /**
     * Amazon voice, Australian English Female, Nicole.
     * @const
     */
    const en_AU_Nicole: Voice;
    /**
     * Amazon voice, German Female, Vicki.
     * @const
     */
    const de_DE_Vicki: Voice;
    /**
     * Amazon voice, German Female (second voice), Marlene.
     * @const
     */
    const de_DE_Marlene: Voice;
    /**
     * Amazon voice, German Male, Hans.
     * @const
     */
    const de_DE_Hans: Voice;
    /**
     * Amazon voice, Danish Female, Naja.
     * @const
     */
    const da_DK_Naja: Voice;
    /**
     * Amazon voice, Danish Male, Mads.
     * @const
     */
    const da_DK_Mads: Voice;
    /**
     * Amazon voice, Welsh Female, Gwyneth.
     * @const
     */
    const cy_GB_Gwyneth: Voice;
    /**
     * Amazon voice, Chinese Mandarin Female, Zhiyu.
     * @const
     */
    const cmn_CN_Zhiyu: Voice;
    /**
     * Amazon voice, Arabic Female, Zeina.
     * @const
     */
    const arb_Zeina: Voice;
  }
}

declare namespace VoiceList {
  namespace Amazon {
    /**
     * List of available premium Amazon TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods that sound more natural due to advanced synthesis technology.
     * @namespace
     */
    namespace Neural {
      /**
       * Neural Amazon voice, Belgian French Female, Isabelle.
       * @const
       */
      const fr_BE_Isabelle: Voice;
      /**
       * Neural Amazon voice, US English Female, Danielle.
       * @const
       */
      const en_US_Danielle: Voice;
      /**
       * Neural Amazon voice, US English Male, Gregory.
       * @const
       */
      const en_US_Gregory: Voice;
      /**
       * Neural Amazon voice, Turkish Female, Burcu.
       * @const
       */
      const tr_TR_Burcu: Voice;
      /**
       * Neural Amazon voice, US English Male, Kevin.
       * @const
       */
      const en_US_Kevin: Voice;
      /**
       * Neural Amazon voice, Swedish Female, Elin.
       * @const
       */
      const sv_SE_Elin: Voice;
      /**
       * Neural Amazon voice, Portuguese Female, Inês.
       * @const
       */
      const pt_PT_Ines: Voice;
      /**
       * Neural Amazon voice, Brazilian Portuguese Female, Vitória.
       * @const
       */
      const pt_BR_Vitoria: Voice;
      /**
       * Neural Amazon voice, Brazilian Portuguese Female (second voice), Camila.
       * @const
       */
      const pt_BR_Camila: Voice;
      /**
       * Neural Amazon voice, Polish Female, Ola.
       * @const
       */
      const pl_PL_Ola: Voice;
      /**
       * Neural Amazon voice, Belgian Dutch Female, Lisa.
       * @const
       */
      const nl_BE_Lisa: Voice;
      /**
       * Neural Amazon voice, Dutch Female, Laura.
       * @const
       */
      const nl_NL_Laura: Voice;
      /**
       * Neural Amazon voice, Norwegian Female, Ida.
       * @const
       */
      const nb_NO_Ida: Voice;
      /**
       * Neural Amazon voice, Korean Female, Seoyeon.
       * @const
       */
      const ko_KR_Seoyeon: Voice;
      /**
       * Neural Amazon voice, Japanese Female, Kazuha.
       * @const
       */
      const ja_JP_Kazuha: Voice;
      /**
       * Neural Amazon voice, Japanese Female (second voice), Tomoko.
       * @const
       */
      const ja_JP_Tomoko: Voice;
      /**
       * Neural Amazon voice, Japanese Male, Takumi.
       * @const
       */
      const ja_JP_Takumi: Voice;
      /**
       * Neural Amazon voice, Italian Female, Bianca.
       * @const
       */
      const it_IT_Bianca: Voice;
      /**
       * Neural Amazon voice, French Female, Léa.
       * @const
       */
      const fr_FR_Lea: Voice;
      /**
       * Neural Amazon voice, Canadian French Female, Gabrielle.
       * @const
       */
      const fr_CA_Gabrielle: Voice;
      /**
       * Neural Amazon voice, US Spanish Female, Lupe.
       * @const
       */
      const es_US_Lupe: Voice;
      /**
       * Neural Amazon voice, Mexican Spanish Female, Mia.
       * @const
       */
      const es_MX_Mia: Voice;
      /**
       * Neural Amazon voice, Castilian Spanish Female, Lucia.
       * @const
       */
      const es_ES_Lucia: Voice;
      /**
       * Neural Amazon voice, US English Female, Salli.
       * @const
       */
      const en_US_Salli: Voice;
      /**
       * Neural Amazon voice, US English Male, Matthew.
       * @const
       */
      const en_US_Matthew: Voice;
      /**
       * Neural Amazon voice, US English Female (second voice), Kimberly.
       * @const
       */
      const en_US_Kimberly: Voice;
      /**
       * Neural Amazon voice, US English Female (third voice), Kendra.
       * @const
       */
      const en_US_Kendra: Voice;
      /**
       * Neural Amazon voice, US English Male (second voice), Justin.
       * @const
       */
      const en_US_Justin: Voice;
      /**
       * Neural Amazon voice, US English Male (third voice), Joey.
       * @const
       */
      const en_US_Joey: Voice;
      /**
       * Neural Amazon voice, US English Female (fourth voice), Joanna.
       * @const
       */
      const en_US_Joanna: Voice;
      /**
       * Neural Amazon voice, US English Female (fifth voice), Ivy.
       * @const
       */
      const en_US_Ivy: Voice;
      /**
       * Neural Amazon voice, New Zealand English Female, Aria.
       * @const
       */
      const en_NZ_Aria: Voice;
      /**
       * Neural Amazon voice, South African English Female, Ayanda.
       * @const
       */
      const en_ZA_Ayanda: Voice;
      /**
       * Neural Amazon voice, British English Female, Emma.
       * @const
       */
      const en_GB_Emma: Voice;
      /**
       * Neural Amazon voice, British English Male, Brian.
       * @const
       */
      const en_GB_Brian: Voice;
      /**
       * Neural Amazon voice, British English Female (second voice), Amy.
       * @const
       */
      const en_GB_Amy: Voice;
      /**
       * Neural Amazon voice, Australian English Female, Olivia.
       * @const
       */
      const en_AU_Olivia: Voice;
      /**
       * Neural Amazon voice, German Female, Vicki.
       * @const
       */
      const de_DE_Vicki: Voice;
      /**
       * Neural Amazon voice, Danish Female, Sofie.
       * @const
       */
      const da_DK_Sofie: Voice;
      /**
       * Neural Amazon voice, Chinese Mandarin Female, Zhiyu.
       * @const
       */
      const cmn_CN_Zhiyu: Voice;
      /**
       * Neural Amazon voice, Gulf Arabic Female, Hala.
       * @const
       */
      const ar_AE_Hala: Voice;
      /**
       * Neural Amazon voice, Catalan Female, Arlet.
       * @const
       */
      const ca_ES_Arlet: Voice;
      /**
       * Neural Amazon voice, Austrian German Female, Hannah.
       * @const
       */
      const de_AT_Hannah: Voice;
      /**
       * Neural Amazon voice, US English Female, Ruth.
       * @const
       */
      const en_US_Ruth: Voice;
      /**
       * Neural Amazon voice, US English Male, Stephen.
       * @const
       */
      const en_US_Stephen: Voice;
      /**
       * Neural Amazon voice, Indian English Female, Kajal.
       * @const
       */
      const en_IN_Kajal: Voice;
      /**
       * Neural Amazon voice, Cantonese Female, Hiujin.
       * @const
       */
      const yue_CN_Hiujin: Voice;
      /**
       * Neural Amazon voice, Finnish Female, Suvi.
       * @const
       */
      const fi_FI_Suvi: Voice;
      /**
       * Neural Amazon voice, Irish English Female, Niamh.
       * @const
       */
      const en_IE_Niamh: Voice;
      /**
       * Neural Amazon voice, British English Male, Arthur.
       * @const
       */
      const en_GB_Arthur: Voice;
      /**
       * Neural Amazon voice, German Male, Daniel.
       * @const
       */
      const de_DE_Daniel: Voice;
      /**
       * Neural Amazon voice, Canadian French Male, Liam.
       * @const
       */
      const fr_CA_Liam: Voice;
      /**
       * Neural Amazon voice, US Spanish Male, Pedro.
       * @const
       */
      const es_US_Pedro: Voice;
      /**
       * Neural Amazon voice, Castilian Spanish Male, Sergio.
       * @const
       */
      const es_ES_Sergio: Voice;
      /**
       * Neural Amazon voice, Mexican Spanish Male, Andrés.
       * @const
       */
      const es_MX_Andres: Voice;
      /**
       * Neural Amazon voice, French Male, Rémi.
       * @const
       */
      const fr_FR_Remi: Voice;
      /**
       * Neural Amazon voice, Italian Male, Adriano.
       * @const
       */
      const it_IT_Adriano: Voice;
      /**
       * Neural Amazon voice, Brazilian Portuguese Male, Thiago.
       * @const
       */
      const pt_BR_Thiago: Voice;
      /**
       * Neural Amazon voice, Gulf Arabic Male, Zayd.
       * @const
       */
      const ar_AE_Zayd: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of available freemium TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
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
   * List of available ElevenLabs TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace ElevenLabs {
    /**
     * ElevenLabs voice, female, middle-aged, British, confident, news.
     * @const
     */
    const Alice: Voice;

    /**
     * ElevenLabs voice, female, middle-aged, American, expressive, social media.
     * @const
     */
    const Aria: Voice;

    /**
     * ElevenLabs voice, male, old, American, trustworthy, narration.
     * @const
     */
    const Bill: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, American, deep, narration.
     * @const
     */
    const Brian: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, Transatlantic, intense, characters.
     * @const
     */
    const Callum: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, Australian, natural, conversational.
     * @const
     */
    const Charlie: Voice;

    /**
     * ElevenLabs voice, female, young, Swedish, seductive, characters.
     * @const
     */
    const Charlotte: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, American, casual, conversational.
     * @const
     */
    const Chris: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, British, authoritative, news.
     * @const
     */
    const Daniel: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, American, friendly, conversational.
     * @const
     */
    const Eric: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, British, warm, narration.
     * @const
     */
    const George: Voice;

    /**
     * ElevenLabs voice, female, young, American, expressive, conversational.
     * @const
     */
    const Jessica: Voice;

    /**
     * ElevenLabs voice, female, young, American, upbeat, social media.
     * @const
     */
    const Laura: Voice;

    /**
     * ElevenLabs voice, male, young, American, articulate, narration.
     * @const
     */
    const Liam: Voice;

    /**
     * ElevenLabs voice, female, middle-aged, British, warm, narration.
     * @const
     */
    const Lily: Voice;

    /**
     * ElevenLabs voice, female, middle-aged, American, friendly, narration.
     * @const
     */
    const Matilda: Voice;

    /**
     * ElevenLabs voice, non-binary, middle-aged, American, confident, social media.
     * @const
     */
    const River: Voice;

    /**
     * ElevenLabs voice, male, middle-aged, American, confident, social media.
     * @const
     */
    const Roger: Voice;

    /**
     * ElevenLabs voice, female, young, American, soft, news.
     * @const
     */
    const Sarah: Voice;

    /**
     * ElevenLabs voice, male, young, American, friendly, social media.
     * @const
     */
    const Will: Voice;

    /**
     * Creates a brand voice with ElevenLabs. To use this method, please contact support.
     * @param name The name of the voice
     */
    const createBrandVoice: (name: string) => Voice;
  }
}
  
declare namespace VoiceList {
  /**
   * List of available Google TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Google {
    /**
     * Google voice, Afrikaans (South Africa) female.
     * @const
     */
    const af_ZA_Standard_A: Voice;
    /**
     * Google voice, Amharic (Ethiopia) female.
     * @const
     */
    const am_ET_Standard_A: Voice;
    /**
     * Google voice, Amharic (Ethiopia) male.
     * @const
     */
    const am_ET_Standard_B: Voice;
    /**
     * Google voice, Amharic (Ethiopia) female.
     * @const
     */
    const am_ET_Wavenet_A: Voice;
    /**
     * Google voice, Amharic (Ethiopia) male.
     * @const
     */
    const am_ET_Wavenet_B: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) female.
     * @const
     */
    const ar_XA_Standard_A: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) male.
     * @const
     */
    const ar_XA_Standard_B: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) male (second voice).
     * @const
     */
    const ar_XA_Standard_C: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) female (second voice).
     * @const
     */
    const ar_XA_Standard_D: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) female.
     * @const
     */
    const ar_XA_Wavenet_A: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) male.
     * @const
     */
    const ar_XA_Wavenet_B: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) male (second voice).
     * @const
     */
    const ar_XA_Wavenet_C: Voice;
    /**
     * Google voice, Arabic (Pseudo-Accents) female (second voice).
     * @const
     */
    const ar_XA_Wavenet_D: Voice;
    /**
     * Google voice, Bulgarian (Bulgaria) female.
     * @const
     */
    const bg_BG_Standard_A: Voice;
    /**
     * Google voice, Bangla (India) female.
     * @const
     */
    const bn_IN_Standard_A: Voice;
    /**
     * Google voice, Bangla (India) male.
     * @const
     */
    const bn_IN_Standard_B: Voice;
    /**
     * Google voice, Bangla (India) female (second voice).
     * @const
     */
    const bn_IN_Standard_C: Voice;
    /**
     * Google voice, Bangla (India) male (second voice).
     * @const
     */
    const bn_IN_Standard_D: Voice;
    /**
     * Google voice, Bangla (India) female.
     * @const
     */
    const bn_IN_Wavenet_A: Voice;
    /**
     * Google voice, Bangla (India) male.
     * @const
     */
    const bn_IN_Wavenet_B: Voice;
    /**
     * Google voice, Bangla (India) female (second voice).
     * @const
     */
    const bn_IN_Wavenet_C: Voice;
    /**
     * Google voice, Bangla (India) male (second voice).
     * @const
     */
    const bn_IN_Wavenet_D: Voice;
    /**
     * Google voice, Catalan (Spain) female.
     * @const
     */
    const ca_ES_Standard_A: Voice;
    /**
     * Google voice, Chinese (China) female.
     * @const
     */
    const cmn_CN_Standard_A: Voice;
    /**
     * Google voice, Chinese (China) male.
     * @const
     */
    const cmn_CN_Standard_B: Voice;
    /**
     * Google voice, Chinese (China) male (second voice).
     * @const
     */
    const cmn_CN_Standard_C: Voice;
    /**
     * Google voice, Chinese (China) female (second voice).
     * @const
     */
    const cmn_CN_Standard_D: Voice;
    /**
     * Google voice, Chinese (China) female.
     * @const
     */
    const cmn_CN_Wavenet_A: Voice;
    /**
     * Google voice, Chinese (China) male.
     * @const
     */
    const cmn_CN_Wavenet_B: Voice;
    /**
     * Google voice, Chinese (China) male (second voice).
     * @const
     */
    const cmn_CN_Wavenet_C: Voice;
    /**
     * Google voice, Chinese (China) female (second voice).
     * @const
     */
    const cmn_CN_Wavenet_D: Voice;
    /**
     * Google voice, Chinese (Taiwan) female.
     * @const
     */
    const cmn_TW_Standard_A: Voice;
    /**
     * Google voice, Chinese (Taiwan) male.
     * @const
     */
    const cmn_TW_Standard_B: Voice;
    /**
     * Google voice, Chinese (Taiwan) male (second voice).
     * @const
     */
    const cmn_TW_Standard_C: Voice;
    /**
     * Google voice, Chinese (Taiwan) female.
     * @const
     */
    const cmn_TW_Wavenet_A: Voice;
    /**
     * Google voice, Chinese (Taiwan) male.
     * @const
     */
    const cmn_TW_Wavenet_B: Voice;
    /**
     * Google voice, Chinese (Taiwan) male (second voice).
     * @const
     */
    const cmn_TW_Wavenet_C: Voice;
    /**
     * Google voice, Czech (Czechia) female.
     * @const
     */
    const cs_CZ_Standard_A: Voice;
    /**
     * Google voice, Czech (Czechia) female.
     * @const
     */
    const cs_CZ_Wavenet_A: Voice;
    /**
     * Google voice, Danish (Denmark) female.
     * @const
     */
    const da_DK_Neural2_D: Voice;
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
     * Google voice, Danish (Denmark) female.
     * @const
     */
    const da_DK_Wavenet_A: Voice;
    /**
     * Google voice, Danish (Denmark) male.
     * @const
     */
    const da_DK_Wavenet_C: Voice;
    /**
     * Google voice, Danish (Denmark) female (second voice).
     * @const
     */
    const da_DK_Wavenet_D: Voice;
    /**
     * Google voice, Danish (Denmark) female (third voice).
     * @const
     */
    const da_DK_Wavenet_E: Voice;
    /**
     * Google voice, German (Germany) female.
     * @const
     */
    const de_DE_Neural2_A: Voice;
    /**
     * Google voice, German (Germany) male.
     * @const
     */
    const de_DE_Neural2_B: Voice;
    /**
     * Google voice, German (Germany) female (second voice).
     * @const
     */
    const de_DE_Neural2_C: Voice;
    /**
     * Google voice, German (Germany) male (second voice).
     * @const
     */
    const de_DE_Neural2_D: Voice;
    /**
     * Google voice, German (Germany) female (third voice).
     * @const
     */
    const de_DE_Neural2_F: Voice;
    /**
     * Google voice, German (Germany) male.
     * @const
     */
    const de_DE_Polyglot_1: Voice;
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
     * Google voice, German (Germany) male.
     * @const
     */
    const de_DE_Studio_B: Voice;
    /**
     * Google voice, German (Germany) female.
     * @const
     */
    const de_DE_Studio_C: Voice;
    /**
     * Google voice, German (Germany) female.
     * @const
     */
    const de_DE_Wavenet_A: Voice;
    /**
     * Google voice, German (Germany) male.
     * @const
     */
    const de_DE_Wavenet_B: Voice;
    /**
     * Google voice, German (Germany) female (second voice).
     * @const
     */
    const de_DE_Wavenet_C: Voice;
    /**
     * Google voice, German (Germany) male (second voice).
     * @const
     */
    const de_DE_Wavenet_D: Voice;
    /**
     * Google voice, German (Germany) male (third voice).
     * @const
     */
    const de_DE_Wavenet_E: Voice;
    /**
     * Google voice, German (Germany) female (third voice).
     * @const
     */
    const de_DE_Wavenet_F: Voice;
    /**
     * Google voice, Greek (Greece) female.
     * @const
     */
    const el_GR_Standard_A: Voice;
    /**
     * Google voice, Greek (Greece) female.
     * @const
     */
    const el_GR_Wavenet_A: Voice;
    /**
     * Google voice, Australian English female.
     * @const
     */
    const en_AU_Neural2_A: Voice;
    /**
     * Google voice, Australian English male.
     * @const
     */
    const en_AU_Neural2_B: Voice;
    /**
     * Google voice, Australian English female (second voice).
     * @const
     */
    const en_AU_Neural2_C: Voice;
    /**
     * Google voice, Australian English male (second voice).
     * @const
     */
    const en_AU_Neural2_D: Voice;
    /**
     * Google voice, Australian English female.
     * @const
     */
    const en_AU_News_E: Voice;
    /**
     * Google voice, Australian English female (second voice).
     * @const
     */
    const en_AU_News_F: Voice;
    /**
     * Google voice, Australian English male.
     * @const
     */
    const en_AU_News_G: Voice;
    /**
     * Google voice, Australian English male.
     * @const
     */
    const en_AU_Polyglot_1: Voice;
    /**
     * Google voice, Australian English female.
     * @const
     */
    const en_AU_Standard_A: Voice;
    /**
     * Google voice, Australian English male.
     * @const
     */
    const en_AU_Standard_B: Voice;
    /**
     * Google voice, Australian English female (second voice).
     * @const
     */
    const en_AU_Standard_C: Voice;
    /**
     * Google voice, Australian English male (second voice).
     * @const
     */
    const en_AU_Standard_D: Voice;
    /**
     * Google voice, Australian English female.
     * @const
     */
    const en_AU_Wavenet_A: Voice;
    /**
     * Google voice, Australian English male.
     * @const
     */
    const en_AU_Wavenet_B: Voice;
    /**
     * Google voice, Australian English female (second voice).
     * @const
     */
    const en_AU_Wavenet_C: Voice;
    /**
     * Google voice, Australian English male (second voice).
     * @const
     */
    const en_AU_Wavenet_D: Voice;
    /**
     * Google voice, British English female.
     * @const
     */
    const en_GB_Neural2_A: Voice;
    /**
     * Google voice, British English male.
     * @const
     */
    const en_GB_Neural2_B: Voice;
    /**
     * Google voice, British English female (second voice).
     * @const
     */
    const en_GB_Neural2_C: Voice;
    /**
     * Google voice, British English male (second voice).
     * @const
     */
    const en_GB_Neural2_D: Voice;
    /**
     * Google voice, British English female (third voice).
     * @const
     */
    const en_GB_Neural2_F: Voice;
    /**
     * Google voice, British English female.
     * @const
     */
    const en_GB_News_G: Voice;
    /**
     * Google voice, British English female (second voice).
     * @const
     */
    const en_GB_News_H: Voice;
    /**
     * Google voice, British English female (third voice).
     * @const
     */
    const en_GB_News_I: Voice;
    /**
     * Google voice, British English male.
     * @const
     */
    const en_GB_News_J: Voice;
    /**
     * Google voice, British English male (second voice).
     * @const
     */
    const en_GB_News_K: Voice;
    /**
     * Google voice, British English male (third voice).
     * @const
     */
    const en_GB_News_L: Voice;
    /**
     * Google voice, British English male (fourth voice).
     * @const
     */
    const en_GB_News_M: Voice;
    /**
     * Google voice, British English female.
     * @const
     */
    const en_GB_Standard_A: Voice;
    /**
     * Google voice, British English male.
     * @const
     */
    const en_GB_Standard_B: Voice;
    /**
     * Google voice, British English female (second voice).
     * @const
     */
    const en_GB_Standard_C: Voice;
    /**
     * Google voice, British English male (second voice).
     * @const
     */
    const en_GB_Standard_D: Voice;
    /**
     * Google voice, British English female (third voice).
     * @const
     */
    const en_GB_Standard_F: Voice;
    /**
     * Google voice, British English male.
     * @const
     */
    const en_GB_Studio_B: Voice;
    /**
     * Google voice, British English female.
     * @const
     */
    const en_GB_Studio_C: Voice;
    /**
     * Google voice, British English female.
     * @const
     */
    const en_GB_Wavenet_A: Voice;
    /**
     * Google voice, British English male.
     * @const
     */
    const en_GB_Wavenet_B: Voice;
    /**
     * Google voice, British English female (second voice).
     * @const
     */
    const en_GB_Wavenet_C: Voice;
    /**
     * Google voice, British English male (second voice).
     * @const
     */
    const en_GB_Wavenet_D: Voice;
    /**
     * Google voice, British English female (third voice).
     * @const
     */
    const en_GB_Wavenet_F: Voice;
    /**
     * Google voice, English (India) female.
     * @const
     */
    const en_IN_Neural2_A: Voice;
    /**
     * Google voice, English (India) male.
     * @const
     */
    const en_IN_Neural2_B: Voice;
    /**
     * Google voice, English (India) male (second voice).
     * @const
     */
    const en_IN_Neural2_C: Voice;
    /**
     * Google voice, English (India) female (second voice).
     * @const
     */
    const en_IN_Neural2_D: Voice;
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
     * Google voice, English (India) female (third voice).
     * @const
     */
    const en_IN_Standard_E: Voice;
    /**
     * Google voice, English (India) male (third voice).
     * @const
     */
    const en_IN_Standard_F: Voice;
    /**
     * Google voice, English (India) female.
     * @const
     */
    const en_IN_Wavenet_A: Voice;
    /**
     * Google voice, English (India) male.
     * @const
     */
    const en_IN_Wavenet_B: Voice;
    /**
     * Google voice, English (India) male (second voice).
     * @const
     */
    const en_IN_Wavenet_C: Voice;
    /**
     * Google voice, English (India) female (second voice).
     * @const
     */
    const en_IN_Wavenet_D: Voice;
    /**
     * Google voice, English (India) female (third voice).
     * @const
     */
    const en_IN_Wavenet_E: Voice;
    /**
     * Google voice, English (India) male (third voice).
     * @const
     */
    const en_IN_Wavenet_F: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Casual_K: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Journey_D: Voice;
    /**
     * Google voice, American English female.
     * @const
     */
    const en_US_Journey_F: Voice;
    /**
     * Google voice, American English female (second voice).
     * @const
     */
    const en_US_Journey_O: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Neural2_A: Voice;
    /**
     * Google voice, American English female.
     * @const
     */
    const en_US_Neural2_C: Voice;
    /**
     * Google voice, American English male (second voice).
     * @const
     */
    const en_US_Neural2_D: Voice;
    /**
     * Google voice, American English female (second voice).
     * @const
     */
    const en_US_Neural2_E: Voice;
    /**
     * Google voice, American English female (third voice).
     * @const
     */
    const en_US_Neural2_F: Voice;
    /**
     * Google voice, American English female (fourth voice).
     * @const
     */
    const en_US_Neural2_G: Voice;
    /**
     * Google voice, American English female (fifth voice).
     * @const
     */
    const en_US_Neural2_H: Voice;
    /**
     * Google voice, American English male (third voice).
     * @const
     */
    const en_US_Neural2_I: Voice;
    /**
     * Google voice, American English male (fourth voice).
     * @const
     */
    const en_US_Neural2_J: Voice;
    /**
     * Google voice, American English female.
     * @const
     */
    const en_US_News_K: Voice;
    /**
     * Google voice, American English female (second voice).
     * @const
     */
    const en_US_News_L: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_News_N: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Polyglot_1: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Standard_A: Voice;
    /**
     * Google voice, American English male (second voice).
     * @const
     */
    const en_US_Standard_B: Voice;
    /**
     * Google voice, American English female.
     * @const
     */
    const en_US_Standard_C: Voice;
    /**
     * Google voice, American English male (third voice).
     * @const
     */
    const en_US_Standard_D: Voice;
    /**
     * Google voice, American English female (second voice).
     * @const
     */
    const en_US_Standard_E: Voice;
    /**
     * Google voice, American English female (third voice).
     * @const
     */
    const en_US_Standard_F: Voice;
    /**
     * Google voice, American English female (fourth voice).
     * @const
     */
    const en_US_Standard_G: Voice;
    /**
     * Google voice, American English female (fifth voice).
     * @const
     */
    const en_US_Standard_H: Voice;
    /**
     * Google voice, American English male (fourth voice).
     * @const
     */
    const en_US_Standard_I: Voice;
    /**
     * Google voice, American English male (fifth voice).
     * @const
     */
    const en_US_Standard_J: Voice;
    /**
     * Google voice, American English female.
     * @const
     */
    const en_US_Studio_O: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Studio_Q: Voice;
    /**
     * Google voice, American English male.
     * @const
     */
    const en_US_Wavenet_A: Voice;
    /**
     * Google voice, American English male (second voice).
     * @const
     */
    const en_US_Wavenet_B: Voice;
    /**
     * Google voice, American English female.
     * @const
     */
    const en_US_Wavenet_C: Voice;
    /**
     * Google voice, American English male (third voice).
     * @const
     */
    const en_US_Wavenet_D: Voice;
    /**
     * Google voice, American English female (second voice).
     * @const
     */
    const en_US_Wavenet_E: Voice;
    /**
     * Google voice, American English female (third voice).
     * @const
     */
    const en_US_Wavenet_F: Voice;
    /**
     * Google voice, American English female (fourth voice).
     * @const
     */
    const en_US_Wavenet_G: Voice;
    /**
     * Google voice, American English female (fifth voice).
     * @const
     */
    const en_US_Wavenet_H: Voice;
    /**
     * Google voice, American English male (fourth voice).
     * @const
     */
    const en_US_Wavenet_I: Voice;
    /**
     * Google voice, American English male (fifth voice).
     * @const
     */
    const en_US_Wavenet_J: Voice;
    /**
     * Google voice, European Spanish female.
     * @const
     */
    const es_ES_Neural2_A: Voice;
    /**
     * Google voice, European Spanish male.
     * @const
     */
    const es_ES_Neural2_B: Voice;
    /**
     * Google voice, European Spanish female (second voice).
     * @const
     */
    const es_ES_Neural2_C: Voice;
    /**
     * Google voice, European Spanish female (third voice).
     * @const
     */
    const es_ES_Neural2_D: Voice;
    /**
     * Google voice, European Spanish female (fourth voice).
     * @const
     */
    const es_ES_Neural2_E: Voice;
    /**
     * Google voice, European Spanish male (second voice).
     * @const
     */
    const es_ES_Neural2_F: Voice;
    /**
     * Google voice, European Spanish male.
     * @const
     */
    const es_ES_Polyglot_1: Voice;
    /**
     * Google voice, European Spanish female.
     * @const
     */
    const es_ES_Standard_A: Voice;
    /**
     * Google voice, European Spanish male.
     * @const
     */
    const es_ES_Standard_B: Voice;
    /**
     * Google voice, European Spanish female (second voice).
     * @const
     */
    const es_ES_Standard_C: Voice;
    /**
     * Google voice, European Spanish female (third voice).
     * @const
     */
    const es_ES_Standard_D: Voice;
    /**
     * Google voice, European Spanish female.
     * @const
     */
    const es_ES_Studio_C: Voice;
    /**
     * Google voice, European Spanish male.
     * @const
     */
    const es_ES_Studio_F: Voice;
    /**
     * Google voice, European Spanish male.
     * @const
     */
    const es_ES_Wavenet_B: Voice;
    /**
     * Google voice, European Spanish female.
     * @const
     */
    const es_ES_Wavenet_C: Voice;
    /**
     * Google voice, European Spanish female (second voice).
     * @const
     */
    const es_ES_Wavenet_D: Voice;
    /**
     * Google voice, Spanish (United States) female.
     * @const
     */
    const es_US_Neural2_A: Voice;
    /**
     * Google voice, Spanish (United States) male.
     * @const
     */
    const es_US_Neural2_B: Voice;
    /**
     * Google voice, Spanish (United States) male (second voice).
     * @const
     */
    const es_US_Neural2_C: Voice;
    /**
     * Google voice, Spanish (United States) male.
     * @const
     */
    const es_US_News_D: Voice;
    /**
     * Google voice, Spanish (United States) male (second voice).
     * @const
     */
    const es_US_News_E: Voice;
    /**
     * Google voice, Spanish (United States) female.
     * @const
     */
    const es_US_News_F: Voice;
    /**
     * Google voice, Spanish (United States) female (second voice).
     * @const
     */
    const es_US_News_G: Voice;
    /**
     * Google voice, Spanish (United States) male.
     * @const
     */
    const es_US_Polyglot_1: Voice;
    /**
     * Google voice, Spanish (United States) female.
     * @const
     */
    const es_US_Standard_A: Voice;
    /**
     * Google voice, Spanish (United States) male.
     * @const
     */
    const es_US_Standard_B: Voice;
    /**
     * Google voice, Spanish (United States) male (second voice).
     * @const
     */
    const es_US_Standard_C: Voice;
    /**
     * Google voice, Spanish (United States) male.
     * @const
     */
    const es_US_Studio_B: Voice;
    /**
     * Google voice, Spanish (United States) female.
     * @const
     */
    const es_US_Wavenet_A: Voice;
    /**
     * Google voice, Spanish (United States) male.
     * @const
     */
    const es_US_Wavenet_B: Voice;
    /**
     * Google voice, Spanish (United States) male (second voice).
     * @const
     */
    const es_US_Wavenet_C: Voice;
    /**
     * Google voice, Basque (Spain) female.
     * @const
     */
    const eu_ES_Standard_A: Voice;
    /**
     * Google voice, Finnish (Finland) female.
     * @const
     */
    const fi_FI_Standard_A: Voice;
    /**
     * Google voice, Finnish (Finland) female.
     * @const
     */
    const fi_FI_Wavenet_A: Voice;
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
     * Google voice, Filipino (Philippines) female.
     * @const
     */
    const fil_PH_Wavenet_A: Voice;
    /**
     * Google voice, Filipino (Philippines) female (second voice).
     * @const
     */
    const fil_PH_Wavenet_B: Voice;
    /**
     * Google voice, Filipino (Philippines) male.
     * @const
     */
    const fil_PH_Wavenet_C: Voice;
    /**
     * Google voice, Filipino (Philippines) male (second voice).
     * @const
     */
    const fil_PH_Wavenet_D: Voice;
    /**
     * Google voice, Filipino (Philippines) female.
     * @const
     */
    const fil_ph_Neural2_A: Voice;
    /**
     * Google voice, Filipino (Philippines) male.
     * @const
     */
    const fil_ph_Neural2_D: Voice;
    /**
     * Google voice, Canadian French female.
     * @const
     */
    const fr_CA_Neural2_A: Voice;
    /**
     * Google voice, Canadian French male.
     * @const
     */
    const fr_CA_Neural2_B: Voice;
    /**
     * Google voice, Canadian French female (second voice).
     * @const
     */
    const fr_CA_Neural2_C: Voice;
    /**
     * Google voice, Canadian French male (second voice).
     * @const
     */
    const fr_CA_Neural2_D: Voice;
    /**
     * Google voice, Canadian French female.
     * @const
     */
    const fr_CA_Standard_A: Voice;
    /**
     * Google voice, Canadian French male.
     * @const
     */
    const fr_CA_Standard_B: Voice;
    /**
     * Google voice, Canadian French female (second voice).
     * @const
     */
    const fr_CA_Standard_C: Voice;
    /**
     * Google voice, Canadian French male (second voice).
     * @const
     */
    const fr_CA_Standard_D: Voice;
    /**
     * Google voice, Canadian French female.
     * @const
     */
    const fr_CA_Wavenet_A: Voice;
    /**
     * Google voice, Canadian French male.
     * @const
     */
    const fr_CA_Wavenet_B: Voice;
    /**
     * Google voice, Canadian French female (second voice).
     * @const
     */
    const fr_CA_Wavenet_C: Voice;
    /**
     * Google voice, Canadian French male (second voice).
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
     * Google voice, French (France) male.
     * @const
     */
    const fr_FR_Polyglot_1: Voice;
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
     * Google voice, French (France) female (fourth voice).
     * @const
     */
    const fr_FR_Standard_F: Voice;
    /**
     * Google voice, French (France) male (third voice).
     * @const
     */
    const fr_FR_Standard_G: Voice;
    /**
     * Google voice, French (France) female.
     * @const
     */
    const fr_FR_Studio_A: Voice;
    /**
     * Google voice, French (France) male.
     * @const
     */
    const fr_FR_Studio_D: Voice;
    /**
     * Google voice, French (France) female.
     * @const
     */
    const fr_FR_Wavenet_A: Voice;
    /**
     * Google voice, French (France) male.
     * @const
     */
    const fr_FR_Wavenet_B: Voice;
    /**
     * Google voice, French (France) female (second voice).
     * @const
     */
    const fr_FR_Wavenet_C: Voice;
    /**
     * Google voice, French (France) male (second voice).
     * @const
     */
    const fr_FR_Wavenet_D: Voice;
    /**
     * Google voice, French (France) female (third voice).
     * @const
     */
    const fr_FR_Wavenet_E: Voice;
    /**
     * Google voice, French (France) female (fourth voice).
     * @const
     */
    const fr_FR_Wavenet_F: Voice;
    /**
     * Google voice, French (France) male (third voice).
     * @const
     */
    const fr_FR_Wavenet_G: Voice;
    /**
     * Google voice, Galician (Spain) female.
     * @const
     */
    const gl_ES_Standard_A: Voice;
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
     * Google voice, Gujarati (India) female (second voice).
     * @const
     */
    const gu_IN_Standard_C: Voice;
    /**
     * Google voice, Gujarati (India) male (second voice).
     * @const
     */
    const gu_IN_Standard_D: Voice;
    /**
     * Google voice, Gujarati (India) female.
     * @const
     */
    const gu_IN_Wavenet_A: Voice;
    /**
     * Google voice, Gujarati (India) male.
     * @const
     */
    const gu_IN_Wavenet_B: Voice;
    /**
     * Google voice, Gujarati (India) female (second voice).
     * @const
     */
    const gu_IN_Wavenet_C: Voice;
    /**
     * Google voice, Gujarati (India) male (second voice).
     * @const
     */
    const gu_IN_Wavenet_D: Voice;
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
     * Google voice, Hebrew (Israel) female.
     * @const
     */
    const he_IL_Wavenet_A: Voice;
    /**
     * Google voice, Hebrew (Israel) male.
     * @const
     */
    const he_IL_Wavenet_B: Voice;
    /**
     * Google voice, Hebrew (Israel) female (second voice).
     * @const
     */
    const he_IL_Wavenet_C: Voice;
    /**
     * Google voice, Hebrew (Israel) male (second voice).
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
     * Google voice, Hindi (India) female (third voice).
     * @const
     */
    const hi_IN_Standard_E: Voice;
    /**
     * Google voice, Hindi (India) male (third voice).
     * @const
     */
    const hi_IN_Standard_F: Voice;
    /**
     * Google voice, Hindi (India) female.
     * @const
     */
    const hi_IN_Wavenet_A: Voice;
    /**
     * Google voice, Hindi (India) male.
     * @const
     */
    const hi_IN_Wavenet_B: Voice;
    /**
     * Google voice, Hindi (India) male (second voice).
     * @const
     */
    const hi_IN_Wavenet_C: Voice;
    /**
     * Google voice, Hindi (India) female (second voice).
     * @const
     */
    const hi_IN_Wavenet_D: Voice;
    /**
     * Google voice, Hindi (India) female (third voice).
     * @const
     */
    const hi_IN_Wavenet_E: Voice;
    /**
     * Google voice, Hindi (India) male (third voice).
     * @const
     */
    const hi_IN_Wavenet_F: Voice;
    /**
     * Google voice, Hungarian (Hungary) female.
     * @const
     */
    const hu_HU_Standard_A: Voice;
    /**
     * Google voice, Hungarian (Hungary) female.
     * @const
     */
    const hu_HU_Wavenet_A: Voice;
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
     * Google voice, Indonesian (Indonesia) female.
     * @const
     */
    const id_ID_Wavenet_A: Voice;
    /**
     * Google voice, Indonesian (Indonesia) male.
     * @const
     */
    const id_ID_Wavenet_B: Voice;
    /**
     * Google voice, Indonesian (Indonesia) male (second voice).
     * @const
     */
    const id_ID_Wavenet_C: Voice;
    /**
     * Google voice, Indonesian (Indonesia) female (second voice).
     * @const
     */
    const id_ID_Wavenet_D: Voice;
    /**
     * Google voice, Icelandic (Iceland) female.
     * @const
     */
    const is_IS_Standard_A: Voice;
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
     * Google voice, Italian (Italy) female.
     * @const
     */
    const it_IT_Wavenet_A: Voice;
    /**
     * Google voice, Italian (Italy) female (second voice).
     * @const
     */
    const it_IT_Wavenet_B: Voice;
    /**
     * Google voice, Italian (Italy) male.
     * @const
     */
    const it_IT_Wavenet_C: Voice;
    /**
     * Google voice, Italian (Italy) male (second voice).
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
     * Google voice, Japanese (Japan) female.
     * @const
     */
    const ja_JP_Wavenet_A: Voice;
    /**
     * Google voice, Japanese (Japan) female (second voice).
     * @const
     */
    const ja_JP_Wavenet_B: Voice;
    /**
     * Google voice, Japanese (Japan) male.
     * @const
     */
    const ja_JP_Wavenet_C: Voice;
    /**
     * Google voice, Japanese (Japan) male (second voice).
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
     * Google voice, Kannada (India) female (second voice).
     * @const
     */
    const kn_IN_Standard_C: Voice;
    /**
     * Google voice, Kannada (India) male (second voice).
     * @const
     */
    const kn_IN_Standard_D: Voice;
    /**
     * Google voice, Kannada (India) female.
     * @const
     */
    const kn_IN_Wavenet_A: Voice;
    /**
     * Google voice, Kannada (India) male.
     * @const
     */
    const kn_IN_Wavenet_B: Voice;
    /**
     * Google voice, Kannada (India) female (second voice).
     * @const
     */
    const kn_IN_Wavenet_C: Voice;
    /**
     * Google voice, Kannada (India) male (second voice).
     * @const
     */
    const kn_IN_Wavenet_D: Voice;
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
     * Google voice, Korean (South Korea) female.
     * @const
     */
    const ko_KR_Wavenet_A: Voice;
    /**
     * Google voice, Korean (South Korea) female (second voice).
     * @const
     */
    const ko_KR_Wavenet_B: Voice;
    /**
     * Google voice, Korean (South Korea) male.
     * @const
     */
    const ko_KR_Wavenet_C: Voice;
    /**
     * Google voice, Korean (South Korea) male (second voice).
     * @const
     */
    const ko_KR_Wavenet_D: Voice;
    /**
     * Google voice, Lithuanian (Lithuania) male.
     * @const
     */
    const lt_LT_Standard_A: Voice;
    /**
     * Google voice, Latvian (Latvia) male.
     * @const
     */
    const lv_LV_Standard_A: Voice;
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
     * Google voice, Malayalam (India) female (second voice).
     * @const
     */
    const ml_IN_Standard_C: Voice;
    /**
     * Google voice, Malayalam (India) male (second voice).
     * @const
     */
    const ml_IN_Standard_D: Voice;
    /**
     * Google voice, Malayalam (India) female.
     * @const
     */
    const ml_IN_Wavenet_A: Voice;
    /**
     * Google voice, Malayalam (India) male.
     * @const
     */
    const ml_IN_Wavenet_B: Voice;
    /**
     * Google voice, Malayalam (India) female (second voice).
     * @const
     */
    const ml_IN_Wavenet_C: Voice;
    /**
     * Google voice, Malayalam (India) male (second voice).
     * @const
     */
    const ml_IN_Wavenet_D: Voice;
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
     * Google voice, Marathi (India) female.
     * @const
     */
    const mr_IN_Wavenet_A: Voice;
    /**
     * Google voice, Marathi (India) male.
     * @const
     */
    const mr_IN_Wavenet_B: Voice;
    /**
     * Google voice, Marathi (India) female (second voice).
     * @const
     */
    const mr_IN_Wavenet_C: Voice;
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
     * Google voice, Malay (Malaysia) female.
     * @const
     */
    const ms_MY_Wavenet_A: Voice;
    /**
     * Google voice, Malay (Malaysia) male.
     * @const
     */
    const ms_MY_Wavenet_B: Voice;
    /**
     * Google voice, Malay (Malaysia) female (second voice).
     * @const
     */
    const ms_MY_Wavenet_C: Voice;
    /**
     * Google voice, Malay (Malaysia) male (second voice).
     * @const
     */
    const ms_MY_Wavenet_D: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) female.
     * @const
     */
    const nb_NO_Standard_A: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) male.
     * @const
     */
    const nb_NO_Standard_B: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) female (second voice).
     * @const
     */
    const nb_NO_Standard_C: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) male (second voice).
     * @const
     */
    const nb_NO_Standard_D: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) female (third voice).
     * @const
     */
    const nb_NO_Standard_E: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) female.
     * @const
     */
    const nb_NO_Wavenet_A: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) male.
     * @const
     */
    const nb_NO_Wavenet_B: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) female (second voice).
     * @const
     */
    const nb_NO_Wavenet_C: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) male (second voice).
     * @const
     */
    const nb_NO_Wavenet_D: Voice;
    /**
     * Google voice, Norwegian Bokmål (Norway) female (third voice).
     * @const
     */
    const nb_NO_Wavenet_E: Voice;
    /**
     * Google voice, Flemish female.
     * @const
     */
    const nl_BE_Standard_A: Voice;
    /**
     * Google voice, Flemish male.
     * @const
     */
    const nl_BE_Standard_B: Voice;
    /**
     * Google voice, Flemish female.
     * @const
     */
    const nl_BE_Wavenet_A: Voice;
    /**
     * Google voice, Flemish male.
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
     * Google voice, Dutch (Netherlands) female.
     * @const
     */
    const nl_NL_Wavenet_A: Voice;
    /**
     * Google voice, Dutch (Netherlands) male.
     * @const
     */
    const nl_NL_Wavenet_B: Voice;
    /**
     * Google voice, Dutch (Netherlands) male (second voice).
     * @const
     */
    const nl_NL_Wavenet_C: Voice;
    /**
     * Google voice, Dutch (Netherlands) female (second voice).
     * @const
     */
    const nl_NL_Wavenet_D: Voice;
    /**
     * Google voice, Dutch (Netherlands) female (third voice).
     * @const
     */
    const nl_NL_Wavenet_E: Voice;
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
     * Google voice, Punjabi (India) female.
     * @const
     */
    const pa_IN_Wavenet_A: Voice;
    /**
     * Google voice, Punjabi (India) male.
     * @const
     */
    const pa_IN_Wavenet_B: Voice;
    /**
     * Google voice, Punjabi (India) female (second voice).
     * @const
     */
    const pa_IN_Wavenet_C: Voice;
    /**
     * Google voice, Punjabi (India) male (second voice).
     * @const
     */
    const pa_IN_Wavenet_D: Voice;
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
     * Google voice, Polish (Poland) female.
     * @const
     */
    const pl_PL_Wavenet_A: Voice;
    /**
     * Google voice, Polish (Poland) male.
     * @const
     */
    const pl_PL_Wavenet_B: Voice;
    /**
     * Google voice, Polish (Poland) male (second voice).
     * @const
     */
    const pl_PL_Wavenet_C: Voice;
    /**
     * Google voice, Polish (Poland) female (second voice).
     * @const
     */
    const pl_PL_Wavenet_D: Voice;
    /**
     * Google voice, Polish (Poland) female (third voice).
     * @const
     */
    const pl_PL_Wavenet_E: Voice;
    /**
     * Google voice, Brazilian Portuguese female.
     * @const
     */
    const pt_BR_Neural2_A: Voice;
    /**
     * Google voice, Brazilian Portuguese male.
     * @const
     */
    const pt_BR_Neural2_B: Voice;
    /**
     * Google voice, Brazilian Portuguese female (second voice).
     * @const
     */
    const pt_BR_Neural2_C: Voice;
    /**
     * Google voice, Brazilian Portuguese female.
     * @const
     */
    const pt_BR_Standard_A: Voice;
    /**
     * Google voice, Brazilian Portuguese male.
     * @const
     */
    const pt_BR_Standard_B: Voice;
    /**
     * Google voice, Brazilian Portuguese female (second voice).
     * @const
     */
    const pt_BR_Standard_C: Voice;
    /**
     * Google voice, Brazilian Portuguese female (third voice).
     * @const
     */
    const pt_BR_Standard_D: Voice;
    /**
     * Google voice, Brazilian Portuguese male (second voice).
     * @const
     */
    const pt_BR_Standard_E: Voice;
    /**
     * Google voice, Brazilian Portuguese female.
     * @const
     */
    const pt_BR_Wavenet_A: Voice;
    /**
     * Google voice, Brazilian Portuguese male.
     * @const
     */
    const pt_BR_Wavenet_B: Voice;
    /**
     * Google voice, Brazilian Portuguese female (second voice).
     * @const
     */
    const pt_BR_Wavenet_C: Voice;
    /**
     * Google voice, Brazilian Portuguese female (third voice).
     * @const
     */
    const pt_BR_Wavenet_D: Voice;
    /**
     * Google voice, Brazilian Portuguese male (second voice).
     * @const
     */
    const pt_BR_Wavenet_E: Voice;
    /**
     * Google voice, European Portuguese female.
     * @const
     */
    const pt_PT_Standard_A: Voice;
    /**
     * Google voice, European Portuguese male.
     * @const
     */
    const pt_PT_Standard_B: Voice;
    /**
     * Google voice, European Portuguese male (second voice).
     * @const
     */
    const pt_PT_Standard_C: Voice;
    /**
     * Google voice, European Portuguese female (second voice).
     * @const
     */
    const pt_PT_Standard_D: Voice;
    /**
     * Google voice, European Portuguese female.
     * @const
     */
    const pt_PT_Wavenet_A: Voice;
    /**
     * Google voice, European Portuguese male.
     * @const
     */
    const pt_PT_Wavenet_B: Voice;
    /**
     * Google voice, European Portuguese male (second voice).
     * @const
     */
    const pt_PT_Wavenet_C: Voice;
    /**
     * Google voice, European Portuguese female (second voice).
     * @const
     */
    const pt_PT_Wavenet_D: Voice;
    /**
     * Google voice, Romanian (Romania) female.
     * @const
     */
    const ro_RO_Standard_A: Voice;
    /**
     * Google voice, Romanian (Romania) female.
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
     * Google voice, Russian (Russia) female.
     * @const
     */
    const ru_RU_Wavenet_A: Voice;
    /**
     * Google voice, Russian (Russia) male.
     * @const
     */
    const ru_RU_Wavenet_B: Voice;
    /**
     * Google voice, Russian (Russia) female (second voice).
     * @const
     */
    const ru_RU_Wavenet_C: Voice;
    /**
     * Google voice, Russian (Russia) male (second voice).
     * @const
     */
    const ru_RU_Wavenet_D: Voice;
    /**
     * Google voice, Russian (Russia) female (third voice).
     * @const
     */
    const ru_RU_Wavenet_E: Voice;
    /**
     * Google voice, Slovak (Slovakia) female.
     * @const
     */
    const sk_SK_Standard_A: Voice;
    /**
     * Google voice, Slovak (Slovakia) female.
     * @const
     */
    const sk_SK_Wavenet_A: Voice;
    /**
     * Google voice, Serbian (Serbia) female.
     * @const
     */
    const sr_RS_Standard_A: Voice;
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
     * Google voice, Swedish (Sweden) female.
     * @const
     */
    const sv_SE_Wavenet_A: Voice;
    /**
     * Google voice, Swedish (Sweden) female (second voice).
     * @const
     */
    const sv_SE_Wavenet_B: Voice;
    /**
     * Google voice, Swedish (Sweden) male.
     * @const
     */
    const sv_SE_Wavenet_C: Voice;
    /**
     * Google voice, Swedish (Sweden) female (third voice).
     * @const
     */
    const sv_SE_Wavenet_D: Voice;
    /**
     * Google voice, Swedish (Sweden) male (second voice).
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
     * Google voice, Tamil (India) female.
     * @const
     */
    const ta_IN_Wavenet_A: Voice;
    /**
     * Google voice, Tamil (India) male.
     * @const
     */
    const ta_IN_Wavenet_B: Voice;
    /**
     * Google voice, Tamil (India) female (second voice).
     * @const
     */
    const ta_IN_Wavenet_C: Voice;
    /**
     * Google voice, Tamil (India) male (second voice).
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
     * Google voice, Turkish (Türkiye) female.
     * @const
     */
    const tr_TR_Standard_A: Voice;
    /**
     * Google voice, Turkish (Türkiye) male.
     * @const
     */
    const tr_TR_Standard_B: Voice;
    /**
     * Google voice, Turkish (Türkiye) female (second voice).
     * @const
     */
    const tr_TR_Standard_C: Voice;
    /**
     * Google voice, Turkish (Türkiye) female (third voice).
     * @const
     */
    const tr_TR_Standard_D: Voice;
    /**
     * Google voice, Turkish (Türkiye) male (second voice).
     * @const
     */
    const tr_TR_Standard_E: Voice;
    /**
     * Google voice, Turkish (Türkiye) female.
     * @const
     */
    const tr_TR_Wavenet_A: Voice;
    /**
     * Google voice, Turkish (Türkiye) male.
     * @const
     */
    const tr_TR_Wavenet_B: Voice;
    /**
     * Google voice, Turkish (Türkiye) female (second voice).
     * @const
     */
    const tr_TR_Wavenet_C: Voice;
    /**
     * Google voice, Turkish (Türkiye) female (third voice).
     * @const
     */
    const tr_TR_Wavenet_D: Voice;
    /**
     * Google voice, Turkish (Türkiye) male (second voice).
     * @const
     */
    const tr_TR_Wavenet_E: Voice;
    /**
     * Google voice, Ukrainian (Ukraine) female.
     * @const
     */
    const uk_UA_Standard_A: Voice;
    /**
     * Google voice, Ukrainian (Ukraine) female.
     * @const
     */
    const uk_UA_Wavenet_A: Voice;
    /**
     * Google voice, Urdu (India) female.
     * @const
     */
    const ur_IN_Standard_A: Voice;
    /**
     * Google voice, Urdu (India) male.
     * @const
     */
    const ur_IN_Standard_B: Voice;
    /**
     * Google voice, Urdu (India) female.
     * @const
     */
    const ur_IN_Wavenet_A: Voice;
    /**
     * Google voice, Urdu (India) male.
     * @const
     */
    const ur_IN_Wavenet_B: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) female.
     * @const
     */
    const vi_VN_Neural2_A: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male.
     * @const
     */
    const vi_VN_Neural2_D: Voice;
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
     * Google voice, Vietnamese (Vietnam) female.
     * @const
     */
    const vi_VN_Wavenet_A: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male.
     * @const
     */
    const vi_VN_Wavenet_B: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) female (second voice).
     * @const
     */
    const vi_VN_Wavenet_C: Voice;
    /**
     * Google voice, Vietnamese (Vietnam) male (second voice).
     * @const
     */
    const vi_VN_Wavenet_D: Voice;
    /**
     * Google voice, Cantonese (Hong Kong SAR China) female.
     * @const
     */
    const yue_HK_Standard_A: Voice;
    /**
     * Google voice, Cantonese (Hong Kong SAR China) male.
     * @const
     */
    const yue_HK_Standard_B: Voice;
    /**
     * Google voice, Cantonese (Hong Kong SAR China) female (second voice).
     * @const
     */
    const yue_HK_Standard_C: Voice;
    /**
     * Google voice, Cantonese (Hong Kong SAR China) male (second voice).
     * @const
     */
    const yue_HK_Standard_D: Voice;
  }
}

declare namespace VoiceList {
  /**
   * List of available IBM TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace IBM {
  }
}

declare namespace VoiceList {
  namespace IBM {
    /**
     * List of available premium IBM TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods that sound more natural due to advanced synthesis technology.
     * @namespace
     */
    namespace Neural {
      /**
       * IBM voice, Dutch(Netherlands) female, Merel.
       * @const
       */
      const nl_NL_Merel: Voice;

      /**
       * IBM voice, English(United Kingdom) female, Charlotte.
       * @const
       */
      const en_GB_Charlotte: Voice;

      /**
       * IBM voice, English(United Kingdom) female, James.
       * @const
       */
      const en_GB_James: Voice;

      /**
       * IBM voice, English(United Kingdom) female, Kate.
       * @const
       */
      const en_GB_Kate: Voice;

      /**
       * IBM voice, English(United States) female, Allison.
       * @const
       */
      const en_US_Allison: Voice;

      /**
       * IBM voice, English(United States) female, Emily.
       * @const
       */
      const en_US_Emily: Voice;

      /**
       * IBM voice, English(United States) male, Henry.
       * @const
       */
      const en_US_Henry: Voice;

      /**
       * IBM voice, English(United States) male, Kevin.
       * @const
       */
      const en_US_Kevin: Voice;

      /**
       * IBM voice, English(United States) female, Lisa.
       * @const
       */
      const en_US_Lisa: Voice;

      /**
       * IBM voice, English(United States) male, Michael.
       * @const
       */
      const en_US_Michael: Voice;

      /**
       * IBM voice, English(United States) female, Olivia.
       * @const
       */
      const en_US_Olivia: Voice;

      /**
       * IBM voice, French(Canadian) female, Louise.
       * @const
       */
      const fr_CA_Louise: Voice;

      /**
       * IBM voice, French female, Nicolas.
       * @const
       */
      const fr_FR_Nicolas: Voice;

      /**
       * IBM voice, French female, Renee.
       * @const
       */
      const fr_FR_Renee: Voice;

      /**
       * IBM voice, German female, Birgit.
       * @const
       */
      const de_DE_Birgit: Voice;

      /**
       * IBM voice, German male, Dieter.
       * @const
       */
      const de_DE_Dieter: Voice;

      /**
       * IBM voice, German female, Erika.
       * @const
       */
      const de_DE_Erika: Voice;

      /**
       * IBM voice, Italian female, Francesca.
       * @const
       */
      const it_IT_Francesca: Voice;

      /**
       * IBM voice, Japanese female, Emi.
       * @const
       */
      const ja_JP_Emi: Voice;

      /**
       * IBM voice, Korean female, Jin.
       * @const
       */
      const ko_KR_Jin: Voice;

      /**
       * IBM voice, Brazilian Portuguese female, Isabela.
       * @const
       */
      const pt_BR_Isabela: Voice;

      /**
       * IBM voice, Spanish(Castilian) male, Enrique.
       * @const
       */
      const es_ES_Enrique: Voice;

      /**
       * IBM voice, Spanish(Castilian) female, Laura.
       * @const
       */
      const es_ES_Laura: Voice;

      /**
       * IBM voice, Spanish(Latin American) female, Sofia.
       * @const
       */
      const es_LA_Sofia: Voice;

      /**
       * IBM voice, Spanish(North American) female, Sofia.
       * @const
       */
      const es_US_Sofia: Voice;

      /**
       * IBM voice, English(Australian) female, Heidi.
       * @const
       */
      const en_AU_Heidi_Expressive: Voice;

      /**
       * IBM voice, English(Australian) female, Jack.
       * @const
       */
      const en_AU_Jack_Expressive: Voice;

      /**
       * IBM voice, English(United States) female, Allison.
       * @const
       */
      const en_US_Allison_Expressive: Voice;

      /**
       * IBM voice, English(United States) female, Emma.
       * @const
       */
      const en_US_Emma_Expressive: Voice;

      /**
       * IBM voice, English(United States) female, Lisa.
       * @const
       */
      const en_US_Lisa_Expressive: Voice;

      /**
       * IBM voice, English(United States) female, Michael.
       * @const
       */
      const en_US_Michael_Expressive: Voice;

      /**
       * IBM voice, Spanish(Latin American) female, Daniela.
       * @const
       */
      const es_LA_DanielaExpressive: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of available Microsoft TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Microsoft {}
}

declare namespace VoiceList {
  namespace Microsoft {
    /**
     * List of available premium Microsoft TTS voices that sound more natural due to advanced synthesis technology.
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
       * Neural Microsoft voice, Amharic (Ethiopia) Female, MekdesNeural.
       * @const
       */
      const am_ET_MekdesNeural: Voice;
      /**
       * Neural Microsoft voice, Amharic (Ethiopia) Male, AmehaNeural.
       * @const
       */
      const am_ET_AmehaNeural: Voice;
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
       * Neural Microsoft voice, Arabic (Bahrain) Female, LailaNeural.
       * @const
       */
      const ar_BH_LailaNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Bahrain) Male, AliNeural.
       * @const
       */
      const ar_BH_AliNeural: Voice;
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
       * Neural Microsoft voice, Arabic (Iraq) Female, RanaNeural.
       * @const
       */
      const ar_IQ_RanaNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Iraq) Male, BasselNeural.
       * @const
       */
      const ar_IQ_BasselNeural: Voice;
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
       * Neural Microsoft voice, Arabic (Kuwait) Female, NouraNeural.
       * @const
       */
      const ar_KW_NouraNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Kuwait) Male, FahedNeural.
       * @const
       */
      const ar_KW_FahedNeural: Voice;
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
       * Neural Microsoft voice, Arabic (Morocco) Female, MounaNeural.
       * @const
       */
      const ar_MA_MounaNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Morocco) Male, JamalNeural.
       * @const
       */
      const ar_MA_JamalNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Oman) Female, AyshaNeural.
       * @const
       */
      const ar_OM_AyshaNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Oman) Male, AbdullahNeural.
       * @const
       */
      const ar_OM_AbdullahNeural: Voice;
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
       * Neural Microsoft voice, Arabic (Saudi Arabia) Female, ZariyahNeural.
       * @const
       */
      const ar_SA_ZariyahNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Saudi Arabia) Male, HamedNeural.
       * @const
       */
      const ar_SA_HamedNeural: Voice;
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
       * Neural Microsoft voice, Arabic (Tunisia) Female, ReemNeural.
       * @const
       */
      const ar_TN_ReemNeural: Voice;
      /**
       * Neural Microsoft voice, Arabic (Tunisia) Male, HediNeural.
       * @const
       */
      const ar_TN_HediNeural: Voice;
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
       * Neural Microsoft voice, Azerbaijani (Latin, Azerbaijan) Female, BanuNeural.
       * @const
       */
      const az_AZ_BanuNeural: Voice;
      /**
       * Neural Microsoft voice, Azerbaijani (Latin, Azerbaijan) Male, BabekNeural.
       * @const
       */
      const az_AZ_BabekNeural: Voice;
      /**
       * Neural Microsoft voice, Bulgarian (Bulgaria) Female, KalinaNeural.
       * @const
       */
      const bg_BG_KalinaNeural: Voice;
      /**
       * Neural Microsoft voice, Bulgarian (Bulgaria) Male, BorislavNeural.
       * @const
       */
      const bg_BG_BorislavNeural: Voice;
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
       * Neural Microsoft voice, Bengali (India) Female, TanishaaNeural.
       * @const
       */
      const bn_IN_TanishaaNeural: Voice;
      /**
       * Neural Microsoft voice, Bengali (India) Male, BashkarNeural.
       * @const
       */
      const bn_IN_BashkarNeural: Voice;
      /**
       * Neural Microsoft voice, Bosnian (Bosnia and Herzegovina) Female, VesnaNeural.
       * @const
       */
      const bs_BA_VesnaNeural: Voice;
      /**
       * Neural Microsoft voice, Bosnian (Bosnia and Herzegovina) Male, GoranNeural.
       * @const
       */
      const bs_BA_GoranNeural: Voice;
      /**
       * Neural Microsoft voice, Catalan (Spain) Female, JoanaNeural.
       * @const
       */
      const ca_ES_JoanaNeural: Voice;
      /**
       * Neural Microsoft voice, Catalan (Spain) Male, EnricNeural.
       * @const
       */
      const ca_ES_EnricNeural: Voice;
      /**
       * Neural Microsoft voice, Catalan (Spain) Female, AlbaNeural.
       * @const
       */
      const ca_ES_AlbaNeural: Voice;
      /**
       * Neural Microsoft voice, Czech (Czechia) Female, VlastaNeural.
       * @const
       */
      const cs_CZ_VlastaNeural: Voice;
      /**
       * Neural Microsoft voice, Czech (Czechia) Male, AntoninNeural.
       * @const
       */
      const cs_CZ_AntoninNeural: Voice;
      /**
       * Neural Microsoft voice, Welsh (United Kingdom) Female, NiaNeural.
       * @const
       */
      const cy_GB_NiaNeural: Voice;
      /**
       * Neural Microsoft voice, Welsh (United Kingdom) Male, AledNeural.
       * @const
       */
      const cy_GB_AledNeural: Voice;
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
       * Neural Microsoft voice, German (Switzerland) Female, LeniNeural.
       * @const
       */
      const de_CH_LeniNeural: Voice;
      /**
       * Neural Microsoft voice, German (Switzerland) Male, JanNeural.
       * @const
       */
      const de_CH_JanNeural: Voice;
      /**
       * Neural Microsoft voice, German (Germany) Female, KatjaNeural.
       * @const
       */
      const de_DE_KatjaNeural: Voice;
      /**
       * Neural Microsoft voice, German (Germany) Male, ConradNeural.
       * @const
       */
      const de_DE_ConradNeural: Voice;
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
       * Neural Microsoft voice, German (Germany) Female, ElkeNeural.
       * @const
       */
      const de_DE_ElkeNeural: Voice;
      /**
       * Neural Microsoft voice, German (Germany) Male, FlorianMultilingualNeural.
       * @const
       */
      const de_DE_FlorianMultilingualNeural: Voice;
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
       * Neural Microsoft voice, German (Germany) Female, SeraphinaMultilingualNeural.
       * @const
       */
      const de_DE_SeraphinaMultilingualNeural: Voice;
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
       * Neural Microsoft voice, English (Australia) Female, AnnetteNeural.
       * @const
       */
      const en_AU_AnnetteNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Female, CarlyNeural.
       * @const
       */
      const en_AU_CarlyNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Male, DarrenNeural.
       * @const
       */
      const en_AU_DarrenNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Male, DuncanNeural.
       * @const
       */
      const en_AU_DuncanNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Female, ElsieNeural.
       * @const
       */
      const en_AU_ElsieNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Female, FreyaNeural.
       * @const
       */
      const en_AU_FreyaNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Female, JoanneNeural.
       * @const
       */
      const en_AU_JoanneNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Male, KenNeural.
       * @const
       */
      const en_AU_KenNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Female, KimNeural.
       * @const
       */
      const en_AU_KimNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Male, NeilNeural.
       * @const
       */
      const en_AU_NeilNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Male, TimNeural.
       * @const
       */
      const en_AU_TimNeural: Voice;
      /**
       * Neural Microsoft voice, English (Australia) Female, TinaNeural.
       * @const
       */
      const en_AU_TinaNeural: Voice;
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
       * Neural Microsoft voice, English (United Kingdom) Female, SoniaNeural.
       * @const
       */
      const en_GB_SoniaNeural: Voice;
      /**
       * Neural Microsoft voice, English (United Kingdom) Male, RyanNeural.
       * @const
       */
      const en_GB_RyanNeural: Voice;
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
       * Neural Microsoft voice, English (United Kingdom) Male, ThomasNeural.
       * @const
       */
      const en_GB_ThomasNeural: Voice;
      /**
       * Neural Microsoft voice, English (Hong Kong SAR) Female, YanNeural.
       * @const
       */
      const en_HK_YanNeural: Voice;
      /**
       * Neural Microsoft voice, English (Hong Kong SAR) Male, SamNeural.
       * @const
       */
      const en_HK_SamNeural: Voice;
      /**
       * Neural Microsoft voice, English (Ireland) Female, EmilyNeural.
       * @const
       */
      const en_IE_EmilyNeural: Voice;
      /**
       * Neural Microsoft voice, English (Ireland) Male, ConnorNeural.
       * @const
       */
      const en_IE_ConnorNeural: Voice;
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
       * Neural Microsoft voice, English (Nigeria) Female, EzinneNeural.
       * @const
       */
      const en_NG_EzinneNeural: Voice;
      /**
       * Neural Microsoft voice, English (Nigeria) Male, AbeoNeural.
       * @const
       */
      const en_NG_AbeoNeural: Voice;
      /**
       * Neural Microsoft voice, English (New Zealand) Female, MollyNeural.
       * @const
       */
      const en_NZ_MollyNeural: Voice;
      /**
       * Neural Microsoft voice, English (New Zealand) Male, MitchellNeural.
       * @const
       */
      const en_NZ_MitchellNeural: Voice;
      /**
       * Neural Microsoft voice, English (Philippines) Female, RosaNeural.
       * @const
       */
      const en_PH_RosaNeural: Voice;
      /**
       * Neural Microsoft voice, English (Philippines) Male, JamesNeural.
       * @const
       */
      const en_PH_JamesNeural: Voice;
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
       * Neural Microsoft voice, English (Tanzania) Female, ImaniNeural.
       * @const
       */
      const en_TZ_ImaniNeural: Voice;
      /**
       * Neural Microsoft voice, English (Tanzania) Male, ElimuNeural.
       * @const
       */
      const en_TZ_ElimuNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, AvaMultilingualNeural.
       * @const
       */
      const en_US_AvaMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, AndrewMultilingualNeural.
       * @const
       */
      const en_US_AndrewMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, EmmaMultilingualNeural.
       * @const
       */
      const en_US_EmmaMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, BrianMultilingualNeural.
       * @const
       */
      const en_US_BrianMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, AvaNeural.
       * @const
       */
      const en_US_AvaNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, AndrewNeural.
       * @const
       */
      const en_US_AndrewNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, EmmaNeural.
       * @const
       */
      const en_US_EmmaNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, BrianNeural.
       * @const
       */
      const en_US_BrianNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, JennyNeural.
       * @const
       */
      const en_US_JennyNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, GuyNeural.
       * @const
       */
      const en_US_GuyNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, AriaNeural.
       * @const
       */
      const en_US_AriaNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, DavisNeural.
       * @const
       */
      const en_US_DavisNeural: Voice;
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
       * Neural Microsoft voice, English (United States) Female, SaraNeural.
       * @const
       */
      const en_US_SaraNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, TonyNeural.
       * @const
       */
      const en_US_TonyNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Female, NancyNeural.
       * @const
       */
      const en_US_NancyNeural: Voice;
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
       * Neural Microsoft voice, English (United States) Female, JennyMultilingualNeural.
       * @const
       */
      const en_US_JennyMultilingualNeural: Voice;
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
       * Neural Microsoft voice, English (United States) Male, RogerNeural.
       * @const
       */
      const en_US_RogerNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, RyanMultilingualNeural.
       * @const
       */
      const en_US_RyanMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, English (United States) Male, SteffanNeural.
       * @const
       */
      const en_US_SteffanNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Bolivia) Female, SofiaNeural.
       * @const
       */
      const es_BO_SofiaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Bolivia) Male, MarceloNeural.
       * @const
       */
      const es_BO_MarceloNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Colombia) Female, SalomeNeural.
       * @const
       */
      const es_CO_SalomeNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Colombia) Male, GonzaloNeural.
       * @const
       */
      const es_CO_GonzaloNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Costa Rica) Female, MariaNeural.
       * @const
       */
      const es_CR_MariaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Costa Rica) Male, JuanNeural.
       * @const
       */
      const es_CR_JuanNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Dominican Republic) Female, RamonaNeural.
       * @const
       */
      const es_DO_RamonaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Dominican Republic) Male, EmilioNeural.
       * @const
       */
      const es_DO_EmilioNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Spain) Female, ElviraNeural.
       * @const
       */
      const es_ES_ElviraNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, AlvaroNeural.
       * @const
       */
      const es_ES_AlvaroNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, AbrilNeural.
       * @const
       */
      const es_ES_AbrilNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, ArnauNeural.
       * @const
       */
      const es_ES_ArnauNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, DarioNeural.
       * @const
       */
      const es_ES_DarioNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, EliasNeural.
       * @const
       */
      const es_ES_EliasNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, EstrellaNeural.
       * @const
       */
      const es_ES_EstrellaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, IreneNeural.
       * @const
       */
      const es_ES_IreneNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, LaiaNeural.
       * @const
       */
      const es_ES_LaiaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, LiaNeural.
       * @const
       */
      const es_ES_LiaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, NilNeural.
       * @const
       */
      const es_ES_NilNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, SaulNeural.
       * @const
       */
      const es_ES_SaulNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Male, TeoNeural.
       * @const
       */
      const es_ES_TeoNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, TrianaNeural.
       * @const
       */
      const es_ES_TrianaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, VeraNeural.
       * @const
       */
      const es_ES_VeraNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Spain) Female, XimenaNeural.
       * @const
       */
      const es_ES_XimenaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Equatorial Guinea) Female, TeresaNeural.
       * @const
       */
      const es_GQ_TeresaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Equatorial Guinea) Male, JavierNeural.
       * @const
       */
      const es_GQ_JavierNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Guatemala) Female, MartaNeural.
       * @const
       */
      const es_GT_MartaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Guatemala) Male, AndresNeural.
       * @const
       */
      const es_GT_AndresNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Honduras) Female, KarlaNeural.
       * @const
       */
      const es_HN_KarlaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Honduras) Male, CarlosNeural.
       * @const
       */
      const es_HN_CarlosNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Mexico) Female, DaliaNeural.
       * @const
       */
      const es_MX_DaliaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Mexico) Male, JorgeNeural.
       * @const
       */
      const es_MX_JorgeNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Mexico) Male, GerardoNeural.
       * @const
       */
      const es_MX_GerardoNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Nicaragua) Female, YolandaNeural.
       * @const
       */
      const es_NI_YolandaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Nicaragua) Male, FedericoNeural.
       * @const
       */
      const es_NI_FedericoNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Peru) Female, CamilaNeural.
       * @const
       */
      const es_PE_CamilaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Peru) Male, AlexNeural.
       * @const
       */
      const es_PE_AlexNeural: Voice;
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
       * Neural Microsoft voice, Spanish (Paraguay) Female, TaniaNeural.
       * @const
       */
      const es_PY_TaniaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Paraguay) Male, MarioNeural.
       * @const
       */
      const es_PY_MarioNeural: Voice;
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
       * Neural Microsoft voice, Spanish (United States) Female, PalomaNeural.
       * @const
       */
      const es_US_PalomaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (United States) Male, AlonsoNeural.
       * @const
       */
      const es_US_AlonsoNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Uruguay) Female, ValentinaNeural.
       * @const
       */
      const es_UY_ValentinaNeural: Voice;
      /**
       * Neural Microsoft voice, Spanish (Uruguay) Male, MateoNeural.
       * @const
       */
      const es_UY_MateoNeural: Voice;
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
       * Neural Microsoft voice, Filipino (Philippines) Female, BlessicaNeural.
       * @const
       */
      const fil_PH_BlessicaNeural: Voice;
      /**
       * Neural Microsoft voice, Filipino (Philippines) Male, AngeloNeural.
       * @const
       */
      const fil_PH_AngeloNeural: Voice;
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
       * Neural Microsoft voice, French (Canada) Male, JeanNeural.
       * @const
       */
      const fr_CA_JeanNeural: Voice;
      /**
       * Neural Microsoft voice, French (Canada) Male, AntoineNeural.
       * @const
       */
      const fr_CA_AntoineNeural: Voice;
      /**
       * Neural Microsoft voice, French (Canada) Male, ThierryNeural.
       * @const
       */
      const fr_CA_ThierryNeural: Voice;
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
       * Neural Microsoft voice, French (France) Female, DeniseNeural.
       * @const
       */
      const fr_FR_DeniseNeural: Voice;
      /**
       * Neural Microsoft voice, French (France) Male, HenriNeural.
       * @const
       */
      const fr_FR_HenriNeural: Voice;
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
       * Neural Microsoft voice, French (France) Female, EloiseNeural.
       * @const
       */
      const fr_FR_EloiseNeural: Voice;
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
       * Neural Microsoft voice, French (France) Male, RemyMultilingualNeural.
       * @const
       */
      const fr_FR_RemyMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, French (France) Female, VivienneMultilingualNeural.
       * @const
       */
      const fr_FR_VivienneMultilingualNeural: Voice;
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
       * Neural Microsoft voice, Irish (Ireland) Female, OrlaNeural.
       * @const
       */
      const ga_IE_OrlaNeural: Voice;
      /**
       * Neural Microsoft voice, Irish (Ireland) Male, ColmNeural.
       * @const
       */
      const ga_IE_ColmNeural: Voice;
      /**
       * Neural Microsoft voice, Galician Female, SabelaNeural.
       * @const
       */
      const gl_ES_SabelaNeural: Voice;
      /**
       * Neural Microsoft voice, Galician Male, RoiNeural.
       * @const
       */
      const gl_ES_RoiNeural: Voice;
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
       * Neural Microsoft voice, Hebrew (Israel) Female, HilaNeural.
       * @const
       */
      const he_IL_HilaNeural: Voice;
      /**
       * Neural Microsoft voice, Hebrew (Israel) Male, AvriNeural.
       * @const
       */
      const he_IL_AvriNeural: Voice;
      /**
       * Neural Microsoft voice, Hindi (India) Female, SwaraNeural.
       * @const
       */
      const hi_IN_SwaraNeural: Voice;
      /**
       * Neural Microsoft voice, Hindi (India) Male, MadhurNeural.
       * @const
       */
      const hi_IN_MadhurNeural: Voice;
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
       * Neural Microsoft voice, Indonesian (Indonesia) Female, GadisNeural.
       * @const
       */
      const id_ID_GadisNeural: Voice;
      /**
       * Neural Microsoft voice, Indonesian (Indonesia) Male, ArdiNeural.
       * @const
       */
      const id_ID_ArdiNeural: Voice;
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
       * Neural Microsoft voice, Italian (Italy) Female, ElsaNeural.
       * @const
       */
      const it_IT_ElsaNeural: Voice;
      /**
       * Neural Microsoft voice, Italian (Italy) Female, IsabellaNeural.
       * @const
       */
      const it_IT_IsabellaNeural: Voice;
      /**
       * Neural Microsoft voice, Italian (Italy) Male, DiegoNeural.
       * @const
       */
      const it_IT_DiegoNeural: Voice;
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
       * Neural Microsoft voice, Italian (Italy) Male, GiuseppeNeural.
       * @const
       */
      const it_IT_GiuseppeNeural: Voice;
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
       * Neural Microsoft voice, Japanese (Japan) Female, AoiNeural.
       * @const
       */
      const ja_JP_AoiNeural: Voice;
      /**
       * Neural Microsoft voice, Japanese (Japan) Male, DaichiNeural.
       * @const
       */
      const ja_JP_DaichiNeural: Voice;
      /**
       * Neural Microsoft voice, Japanese (Japan) Female, MayuNeural.
       * @const
       */
      const ja_JP_MayuNeural: Voice;
      /**
       * Neural Microsoft voice, Japanese (Japan) Male, NaokiNeural.
       * @const
       */
      const ja_JP_NaokiNeural: Voice;
      /**
       * Neural Microsoft voice, Japanese (Japan) Female, ShioriNeural.
       * @const
       */
      const ja_JP_ShioriNeural: Voice;
      /**
       * Neural Microsoft voice, Javanese (Latin, Indonesia) Female, SitiNeural.
       * @const
       */
      const jv_ID_SitiNeural: Voice;
      /**
       * Neural Microsoft voice, Javanese (Latin, Indonesia) Male, DimasNeural.
       * @const
       */
      const jv_ID_DimasNeural: Voice;
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
       * Neural Microsoft voice, Khmer (Cambodia) Female, SreymomNeural.
       * @const
       */
      const km_KH_SreymomNeural: Voice;
      /**
       * Neural Microsoft voice, Khmer (Cambodia) Male, PisethNeural.
       * @const
       */
      const km_KH_PisethNeural: Voice;
      /**
       * Neural Microsoft voice, Kannada (India) Female, SapnaNeural.
       * @const
       */
      const kn_IN_SapnaNeural: Voice;
      /**
       * Neural Microsoft voice, Kannada (India) Male, GaganNeural.
       * @const
       */
      const kn_IN_GaganNeural: Voice;
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
       * Neural Microsoft voice, Korean (Korea) Male, BongJinNeural.
       * @const
       */
      const ko_KR_BongJinNeural: Voice;
      /**
       * Neural Microsoft voice, Korean (Korea) Male, GookMinNeural.
       * @const
       */
      const ko_KR_GookMinNeural: Voice;
      /**
       * Neural Microsoft voice, Korean (Korea) Male, HyunsuNeural.
       * @const
       */
      const ko_KR_HyunsuNeural: Voice;
      /**
       * Neural Microsoft voice, Korean (Korea) Female, JiMinNeural.
       * @const
       */
      const ko_KR_JiMinNeural: Voice;
      /**
       * Neural Microsoft voice, Korean (Korea) Female, SeoHyeonNeural.
       * @const
       */
      const ko_KR_SeoHyeonNeural: Voice;
      /**
       * Neural Microsoft voice, Korean (Korea) Female, SoonBokNeural.
       * @const
       */
      const ko_KR_SoonBokNeural: Voice;
      /**
       * Neural Microsoft voice, Korean (Korea) Female, YuJinNeural.
       * @const
       */
      const ko_KR_YuJinNeural: Voice;
      /**
       * Neural Microsoft voice, Lao (Laos) Female, KeomanyNeural.
       * @const
       */
      const lo_LA_KeomanyNeural: Voice;
      /**
       * Neural Microsoft voice, Lao (Laos) Male, ChanthavongNeural.
       * @const
       */
      const lo_LA_ChanthavongNeural: Voice;
      /**
       * Neural Microsoft voice, Lithuanian (Lithuania) Female, OnaNeural.
       * @const
       */
      const lt_LT_OnaNeural: Voice;
      /**
       * Neural Microsoft voice, Lithuanian (Lithuania) Male, LeonasNeural.
       * @const
       */
      const lt_LT_LeonasNeural: Voice;
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
       * Neural Microsoft voice, Macedonian (North Macedonia) Female, MarijaNeural.
       * @const
       */
      const mk_MK_MarijaNeural: Voice;
      /**
       * Neural Microsoft voice, Macedonian (North Macedonia) Male, AleksandarNeural.
       * @const
       */
      const mk_MK_AleksandarNeural: Voice;
      /**
       * Neural Microsoft voice, Malayalam (India) Female, SobhanaNeural.
       * @const
       */
      const ml_IN_SobhanaNeural: Voice;
      /**
       * Neural Microsoft voice, Malayalam (India) Male, MidhunNeural.
       * @const
       */
      const ml_IN_MidhunNeural: Voice;
      /**
       * Neural Microsoft voice, Mongolian (Mongolia) Female, YesuiNeural.
       * @const
       */
      const mn_MN_YesuiNeural: Voice;
      /**
       * Neural Microsoft voice, Mongolian (Mongolia) Male, BataaNeural.
       * @const
       */
      const mn_MN_BataaNeural: Voice;
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
       * Neural Microsoft voice, Malay (Malaysia) Female, YasminNeural.
       * @const
       */
      const ms_MY_YasminNeural: Voice;
      /**
       * Neural Microsoft voice, Malay (Malaysia) Male, OsmanNeural.
       * @const
       */
      const ms_MY_OsmanNeural: Voice;
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
       * Neural Microsoft voice, Dutch (Belgium) Female, DenaNeural.
       * @const
       */
      const nl_BE_DenaNeural: Voice;
      /**
       * Neural Microsoft voice, Dutch (Belgium) Male, ArnaudNeural.
       * @const
       */
      const nl_BE_ArnaudNeural: Voice;
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
       * Neural Microsoft voice, Dutch (Netherlands) Female, ColetteNeural.
       * @const
       */
      const nl_NL_ColetteNeural: Voice;
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
       * Neural Microsoft voice, Pashto (Afghanistan) Female, LatifaNeural.
       * @const
       */
      const ps_AF_LatifaNeural: Voice;
      /**
       * Neural Microsoft voice, Pashto (Afghanistan) Male, GulNawazNeural.
       * @const
       */
      const ps_AF_GulNawazNeural: Voice;
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
       * Neural Microsoft voice, Portuguese (Brazil) Female, ThalitaNeural.
       * @const
       */
      const pt_BR_ThalitaNeural: Voice;
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
       * Neural Microsoft voice, Portuguese (Portugal) Female, RaquelNeural.
       * @const
       */
      const pt_PT_RaquelNeural: Voice;
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
       * Neural Microsoft voice, Russian (Russia) Male, DmitryNeural.
       * @const
       */
      const ru_RU_DmitryNeural: Voice;
      /**
       * Neural Microsoft voice, Russian (Russia) Female, DariyaNeural.
       * @const
       */
      const ru_RU_DariyaNeural: Voice;
      /**
       * Neural Microsoft voice, Sinhala (Sri Lanka) Female, ThiliniNeural.
       * @const
       */
      const si_LK_ThiliniNeural: Voice;
      /**
       * Neural Microsoft voice, Sinhala (Sri Lanka) Male, SameeraNeural.
       * @const
       */
      const si_LK_SameeraNeural: Voice;
      /**
       * Neural Microsoft voice, Slovak (Slovakia) Female, ViktoriaNeural.
       * @const
       */
      const sk_SK_ViktoriaNeural: Voice;
      /**
       * Neural Microsoft voice, Slovak (Slovakia) Male, LukasNeural.
       * @const
       */
      const sk_SK_LukasNeural: Voice;
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
       * Neural Microsoft voice, Somali (Somalia) Female, UbaxNeural.
       * @const
       */
      const so_SO_UbaxNeural: Voice;
      /**
       * Neural Microsoft voice, Somali (Somalia) Male, MuuseNeural.
       * @const
       */
      const so_SO_MuuseNeural: Voice;
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
       * Neural Microsoft voice, Serbian (Latin, Serbia) Male, RS.
       * @const
       */
      const sr_Latn_RS_NicholasNeural: Voice;
      /**
       * Neural Microsoft voice, Serbian (Latin, Serbia) Female, RS.
       * @const
       */
      const sr_Latn_RS_SophieNeural: Voice;
      /**
       * Neural Microsoft voice, Serbian (Cyrillic, Serbia) Female, SophieNeural.
       * @const
       */
      const sr_RS_SophieNeural: Voice;
      /**
       * Neural Microsoft voice, Serbian (Cyrillic, Serbia) Male, NicholasNeural.
       * @const
       */
      const sr_RS_NicholasNeural: Voice;
      /**
       * Neural Microsoft voice, Sundanese (Indonesia) Female, TutiNeural.
       * @const
       */
      const su_ID_TutiNeural: Voice;
      /**
       * Neural Microsoft voice, Sundanese (Indonesia) Male, JajangNeural.
       * @const
       */
      const su_ID_JajangNeural: Voice;
      /**
       * Neural Microsoft voice, Swedish (Sweden) Female, SofieNeural.
       * @const
       */
      const sv_SE_SofieNeural: Voice;
      /**
       * Neural Microsoft voice, Swedish (Sweden) Male, MattiasNeural.
       * @const
       */
      const sv_SE_MattiasNeural: Voice;
      /**
       * Neural Microsoft voice, Swedish (Sweden) Female, HilleviNeural.
       * @const
       */
      const sv_SE_HilleviNeural: Voice;
      /**
       * Neural Microsoft voice, Swahili (Kenya) Female, ZuriNeural.
       * @const
       */
      const sw_KE_ZuriNeural: Voice;
      /**
       * Neural Microsoft voice, Swahili (Kenya) Male, RafikiNeural.
       * @const
       */
      const sw_KE_RafikiNeural: Voice;
      /**
       * Neural Microsoft voice, Swahili (Tanzania) Female, RehemaNeural.
       * @const
       */
      const sw_TZ_RehemaNeural: Voice;
      /**
       * Neural Microsoft voice, Swahili (Tanzania) Male, DaudiNeural.
       * @const
       */
      const sw_TZ_DaudiNeural: Voice;
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
       * Neural Microsoft voice, Tamil (Sri Lanka) Female, SaranyaNeural.
       * @const
       */
      const ta_LK_SaranyaNeural: Voice;
      /**
       * Neural Microsoft voice, Tamil (Sri Lanka) Male, KumarNeural.
       * @const
       */
      const ta_LK_KumarNeural: Voice;
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
       * Neural Microsoft voice, Tamil (Singapore) Female, VenbaNeural.
       * @const
       */
      const ta_SG_VenbaNeural: Voice;
      /**
       * Neural Microsoft voice, Tamil (Singapore) Male, AnbuNeural.
       * @const
       */
      const ta_SG_AnbuNeural: Voice;
      /**
       * Neural Microsoft voice, Telugu (India) Female, ShrutiNeural.
       * @const
       */
      const te_IN_ShrutiNeural: Voice;
      /**
       * Neural Microsoft voice, Telugu (India) Male, MohanNeural.
       * @const
       */
      const te_IN_MohanNeural: Voice;
      /**
       * Neural Microsoft voice, Thai (Thailand) Female, PremwadeeNeural.
       * @const
       */
      const th_TH_PremwadeeNeural: Voice;
      /**
       * Neural Microsoft voice, Thai (Thailand) Male, NiwatNeural.
       * @const
       */
      const th_TH_NiwatNeural: Voice;
      /**
       * Neural Microsoft voice, Thai (Thailand) Female, AcharaNeural.
       * @const
       */
      const th_TH_AcharaNeural: Voice;
      /**
       * Neural Microsoft voice, Turkish (Turkey) Female, EmelNeural.
       * @const
       */
      const tr_TR_EmelNeural: Voice;
      /**
       * Neural Microsoft voice, Turkish (Turkey) Male, AhmetNeural.
       * @const
       */
      const tr_TR_AhmetNeural: Voice;
      /**
       * Neural Microsoft voice, Ukrainian (Ukraine) Female, PolinaNeural.
       * @const
       */
      const uk_UA_PolinaNeural: Voice;
      /**
       * Neural Microsoft voice, Ukrainian (Ukraine) Male, OstapNeural.
       * @const
       */
      const uk_UA_OstapNeural: Voice;
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
       * Neural Microsoft voice, Urdu (Pakistan) Female, UzmaNeural.
       * @const
       */
      const ur_PK_UzmaNeural: Voice;
      /**
       * Neural Microsoft voice, Urdu (Pakistan) Male, AsadNeural.
       * @const
       */
      const ur_PK_AsadNeural: Voice;
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
       * Neural Microsoft voice, Chinese (Wu, Simplified) Female, XiaotongNeural.
       * @const
       */
      const wuu_CN_XiaotongNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Wu, Simplified) Male, YunzheNeural.
       * @const
       */
      const wuu_CN_YunzheNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Cantonese, Simplified) Female, XiaoMinNeural.
       * @const
       */
      const yue_CN_XiaoMinNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Cantonese, Simplified) Male, YunSongNeural.
       * @const
       */
      const yue_CN_YunSongNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoxiaoNeural.
       * @const
       */
      const zh_CN_XiaoxiaoNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunxiNeural.
       * @const
       */
      const zh_CN_YunxiNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunjianNeural.
       * @const
       */
      const zh_CN_YunjianNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyiNeural.
       * @const
       */
      const zh_CN_XiaoyiNeural: Voice;
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
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaochenMultilingualNeural.
       * @const
       */
      const zh_CN_XiaochenMultilingualNeural: Voice;
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
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaorouNeural.
       * @const
       */
      const zh_CN_XiaorouNeural: Voice;
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
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoxiaoDialectsNeural.
       * @const
       */
      const zh_CN_XiaoxiaoDialectsNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoxiaoMultilingualNeural.
       * @const
       */
      const zh_CN_XiaoxiaoMultilingualNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyanNeural.
       * @const
       */
      const zh_CN_XiaoyanNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyouNeural.
       * @const
       */
      const zh_CN_XiaoyouNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Female, XiaoyuMultilingualNeural.
       * @const
       */
      const zh_CN_XiaoyuMultilingualNeural: Voice;
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
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunjieNeural.
       * @const
       */
      const zh_CN_YunjieNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunxiaNeural.
       * @const
       */
      const zh_CN_YunxiaNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunyeNeural.
       * @const
       */
      const zh_CN_YunyeNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Mandarin, Simplified) Male, YunyiMultilingualNeural.
       * @const
       */
      const zh_CN_YunyiMultilingualNeural: Voice;
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
       * Neural Microsoft voice, Chinese (Northeastern Mandarin, Simplified) Female, liaoning.
       * @const
       */
      const zh_CN_liaoning_XiaobeiNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Zhongyuan Mandarin Shaanxi, Simplified) Female, shaanxi.
       * @const
       */
      const zh_CN_shaanxi_XiaoniNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Jilu Mandarin, Simplified) Male, shandong.
       * @const
       */
      const zh_CN_shandong_YunxiangNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Southwestern Mandarin, Simplified) Male, sichuan.
       * @const
       */
      const zh_CN_sichuan_YunxiNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Cantonese, Traditional) Female, HiuMaanNeural.
       * @const
       */
      const zh_HK_HiuMaanNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Cantonese, Traditional) Male, WanLungNeural.
       * @const
       */
      const zh_HK_WanLungNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Cantonese, Traditional) Female, HiuGaaiNeural.
       * @const
       */
      const zh_HK_HiuGaaiNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Taiwanese Mandarin, Traditional) Female, HsiaoChenNeural.
       * @const
       */
      const zh_TW_HsiaoChenNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Taiwanese Mandarin, Traditional) Male, YunJheNeural.
       * @const
       */
      const zh_TW_YunJheNeural: Voice;
      /**
       * Neural Microsoft voice, Chinese (Taiwanese Mandarin, Traditional) Female, HsiaoYuNeural.
       * @const
       */
      const zh_TW_HsiaoYuNeural: Voice;
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
   * List of availabl SaluteSpeech TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
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
    const createBrandVoice: (name: string) => Voice;
  }
}

declare namespace VoiceList {
  /**
   * List of available T-Bank TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace TBank {
    /**
     * T-Bank voice, Russian female.
     * @const
     */
    const ru_RU_Alyona: Voice;
    /**
     * T-Bank voice, Russian female, sad.
     * @const
     */
    const ru_RU_Alyona_sad: Voice;
    /**
     * T-Bank voice, Russian female, funny.
     * @const
     */
    const ru_RU_Alyona_funny: Voice;
    /**
     * T-Bank voice, Russian female, flirt.
     * @const
     */
    const ru_RU_Alyona_flirt: Voice;
    /**
     * T-Bank voice, Russian male, neutral.
     * @const
     */
    const ru_RU_Dorofeev_neutral: Voice;
    /**
     * T-Bank voice, Russian male, drama.
     * @const
     */
    const ru_RU_Dorofeev_drama: Voice;
    /**
     * T-Bank voice, Russian male, comedy.
     * @const
     */
    const ru_RU_Dorofeev_comedy: Voice;
    /**
     * T-Bank voice, Russian male, info.
     * @const
     */
    const ru_RU_Dorofeev_info: Voice;
    /**
     * T-Bank voice, Russian male, tragedy.
     * @const
     */
    const ru_RU_Dorofeev_tragedy: Voice;
  }
}

/**
 * List of available TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods.
 */
declare namespace VoiceList {
}

declare namespace VoiceList {
  namespace Yandex {
    /**
     * List of available premium Yandex TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods that sound more natural due to advanced synthesis technology.
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
       * Neural Yandex voice, Kazakh (Kazakhstan) male, Amira.
       * @const
       */
      const kk_KK_amira: Voice;
      /**
       * Neural Yandex voice, Kazakh (Kazakhstan) male, Madi.
       * @const
       */
      const kk_KK_madi: Voice;
      /**
       * Neural Yandex voice, Russian female, Alena.
       * @const
       */
      const ru_RU_alena: Voice;
      /**
       * Neural Yandex voice, Russian male, Filipp.
       * @const
       */
      const ru_RU_filipp: Voice;
      /**
       * Neural Yandex voice, Russian male, Ermil.
       * @const
       */
      const ru_RU_ermil: Voice;
      /**
       * Neural Yandex voice, Russian female, Jane.
       * @const
       */
      const ru_RU_jane: Voice;
      /**
       * Neural Yandex voice, Russian male, Madirus.
       * @const
       */
      const ru_RU_madirus: Voice;
      /**
       * Neural Yandex voice, Russian female, Omazh.
       * @const
       */
      const ru_RU_omazh: Voice;
      /**
       * Neural Yandex voice, Russian male, Zahar.
       * @const
       */
      const ru_RU_zahar: Voice;
      /**
       * Neural Yandex voice, Uzbek (Uzbekistan) female, Nigora.
       * @const
       */
      const uz_UZ_nigora: Voice;
    }
  }
}

declare namespace VoiceList {
  /**
   * List of available Yandex TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace Yandex {
  }
}

declare namespace VoiceList {
  /**
   * List of available YandexV3 TTS voices for the [Call.say] and [VoxEngine.createTTSPlayer] methods. Depending on the voice, different technologies are used to make synthesized voices sound as close as possible to live human voices. Please note that using these text-to-speech capabilities are charged according to the <a href="https://voximplant.com/pricing" target="_blank">pricing</a>.
   */
  namespace YandexV3 {
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
     * Neural Yandex voice, Hebrew female, Naomi.
     * @const
     */
    const he_IL_naomi: Voice;
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
     * Neural Yandex voice, Russian male, Filipp.
     * @const
     */
    const ru_RU_filipp: Voice;
    /**
     * Yandex voice, Russian male, Ermil.
     * @const
     */
    const ru_RU_ermil: Voice;
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
     * Yandex voice, Russian female, Dasha.
     * @const
     */
    const ru_RU_dasha: Voice;
    /**
     * Yandex voice, Russian female, Julia.
     * @const
     */
    const ru_RU_julia: Voice;
    /**
     * Yandex voice, Russian female, Lera.
     * @const
     */
    const ru_RU_lera: Voice;
    /**
     * Yandex voice, Russian female, Masha.
     * @const
     */
    const ru_RU_masha: Voice;
    /**
     * Yandex voice, Russian female, Marina.
     * @const
     */
    const ru_RU_marina: Voice;
    /**
     * Yandex voice, Russian male, Alexander.
     * @const
     */
    const ru_RU_alexander: Voice;
    /**
     * Yandex voice, Russian male, Kirill.
     * @const
     */
    const ru_RU_kirill: Voice;
    /**
     * Yandex voice, Russian male, Anton.
     * @const
     */
    const ru_RU_anton: Voice;
    /**
     * Yandex voice, Uzbek (Uzbekistan) female, Nigora.
     * @const
     */
    const uz_UZ_nigora: Voice;
  }
}

/**
 * Represents a language and a voice for TTS. List of all supported voices: [VoiceList].
 */
declare class Voice {
}
