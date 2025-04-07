const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const output = document.getElementById('output');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const savedNotes = document.getElementById('savedNotes');

// Check if browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let finalTranscript = '';

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        output.textContent = finalTranscript; // Start with existing content
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        
        // Combine new results with existing content
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Display both final and interim results
        output.innerHTML = finalTranscript + '<span style="color:#999">' + interimTranscript + '</span>';
        
        // Auto-scroll to bottom for long text
        output.scrollTop = output.scrollHeight;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        output.textContent += `\n[Error: ${event.error}]`;
    };

    recognition.onend = () => {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        // Preserve all transcribed text
        output.textContent = finalTranscript;
    };

    startBtn.addEventListener('click', () => {
        recognition.start();
    });

    stopBtn.addEventListener('click', () => {
        recognition.stop();
    });
} else {
    alert("Your browser doesn't support speech recognition. Try Chrome or Edge.");
}

// Save note to localStorage (now clears after saving)
saveBtn.addEventListener('click', () => {
    const note = output.textContent.trim();
    if (note) {
        let notes = JSON.parse(localStorage.getItem('speechNotes') || '[]');
        notes.push(note);
        localStorage.setItem('speechNotes', JSON.stringify(notes));
        renderSavedNotes();
        
        // Clear the text box after saving
        output.textContent = '';
        finalTranscript = ''; // Reset accumulated transcript
    }
});

// Clear current text manually
clearBtn.addEventListener('click', () => {
    if (confirm("Clear current transcription?")) {
        output.textContent = '';
        finalTranscript = '';
    }
});

// Load saved notes on page load
function renderSavedNotes() {
    const notes = JSON.parse(localStorage.getItem('speechNotes') || '[]');
    savedNotes.innerHTML = notes.map((note, index) => `
        <div class="note">
            <p>${note}</p>
            <button onclick="deleteNote(${index})">Delete</button>
            <button onclick="copyNote(${index})">Copy</button>
        </div>
    `).join('');
}

// Delete a note
window.deleteNote = (index) => {
    let notes = JSON.parse(localStorage.getItem('speechNotes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('speechNotes', JSON.stringify(notes));
    renderSavedNotes();
};

// Copy a note
window.copyNote = (index) => {
    const notes = JSON.parse(localStorage.getItem('speechNotes') || '[]');
    navigator.clipboard.writeText(notes[index]);
    alert('Copied to clipboard!');
};

// Initialize saved notes on load
document.addEventListener('DOMContentLoaded', renderSavedNotes);