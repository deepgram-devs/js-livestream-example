// Import what we need from the deepgram library
const { createClient, LiveTranscriptionEvents } = deepgram;
// Initialize variable
let mediaRecorder;


const startRecording = async () => {
  // Create a Deepgram client with your API key (remember not to push up your code with this key)
  const deepgram = createClient("");

  // Set up a live transcription connection
  const dgConnection = deepgram.listen.live({ model: "nova" });

  // DG event handler when the transcription connection is open
  dgConnection.on(LiveTranscriptionEvents.Open, () => {
    // DG event handler for incoming transcription data
    dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
      // Display the transcript in the captions div
      document.querySelector('#captions').textContent += data.channel.alternatives[0].transcript + ' ';
    });

    // Get access to the microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {

        // Create a media recorder with the audio stream
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        // Event handler when audio data is available from the mic
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0) {
            // Send audio data to Deepgram connection
            dgConnection.send(event.data);
          }
        });

        // Start recording every 1000 milliseconds (1 second)
        mediaRecorder.start(1000);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  });
};


// Event listener for the record button
document.querySelector('#record').addEventListener('click', () => {
  // Check if recording is in progress
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    // Stop recording if in progress
    mediaRecorder.stop();
    document.querySelector('#status').textContent = '';
  } else {
    // Start recording if not in progress
    startRecording();
    document.querySelector('#status').textContent = 'Listening...';
  }
});