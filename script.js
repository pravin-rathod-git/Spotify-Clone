console.log("lets write javascript code");

// Declare global variables to store song data and current song context
let songs;
let currentsong;
let currentfolder;

/**
 * Converts seconds to a MM:SS format.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The time formatted as MM:SS.
 */
function secondsToMinutesSeconds(seconds) {
    // Return "00:00" if input is invalid
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Fetches the list of songs from a specified folder and updates the UI.
 * @param {string} folder - The folder name to fetch songs from.
 * @returns {Promise<string[]>} - A promise that resolves to an array of song names.
 */
async function getSongs(folder) {
    currentfolder = folder;
    // Fetch the songs from the server
    let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let text = await response.text(); // Await the promise to get the response text

    // Create a temporary div to parse the response HTML
    let div = document.createElement("div");
    div.innerHTML = text;

    // Get all <a> elements from the div
    let as = div.getElementsByTagName("a");

    // Initialize an array to store the song names
    songs = [];

    // Iterate over each <a> element
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        // Check if the href attribute ends with ".mp3"
        if (element.href.endsWith(".mp3")) {
            // Extract the song name from the href
            const name = element.href.split(`/${folder}/`)[1];
            songs.push(name);
        }
    }

    // Update the song list in the UI
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear existing list items
    for (const song of songs) {
        songUL.innerHTML += `<li> 
                             <img class="invert" src="player.svg" alt="">
                            <div class="play-song">
                                <div class="song-name">${song}</div>
                                <div class="song-artist"> Pravin</div>
                            </div>

                            <div class="play-now flex item-center justify-content">
                                <span>Play now</span>
                                <img src="play.svg" class="invert" alt="">
                            </div>
                             </li>`;
    }

    // Add click event listeners to each song item to play the selected song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".play-song").firstElementChild.innerHTML);
            playMusic(e.querySelector(".play-song").firstElementChild.innerHTML.trim());
        });
    });

    // Add click event listeners to each card to fetch and play songs from a selected folder
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            console.log(item.currentTarget.dataset.folder);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });

    // Return the array of song names
    return songs;
}

/**
 * Plays the selected music track.
 * @param {string} track - The name of the track to play.
 * @param {boolean} [pause=false] - Whether to pause the track if true.
 */
const playMusic = (track, pause = false) => {
    currentsong.src = `/${currentfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg"; // Update play button icon to "pause"
    }
    document.querySelector(".song-info").innerHTML = track;
    document.querySelector(".song-time").innerHTML = `00:00/00:00`;

    // Update the time of the running song
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}|${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });
};

/**
 * Main function to initialize the music player.
 */
async function main() {
    currentsong = new Audio(); // Create a new Audio object
    await getSongs("songs"); // Fetch and display songs from the initial folder
    console.log(songs);
    playMusic(songs[0], true); // Play the first song in the list, paused initially

    // Add click event listener to the play button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg"; // Change icon to show that song is playing
        } else {
            currentsong.pause();
            play.src = "play.svg"; // Change icon to show that song is paused
        }
    });

    // Add click event listener to the seek bar for adjusting playback time
    document.querySelector(".seek").addEventListener("click", e => {
        let percent = document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Add click event listener to the previous button to play the previous song
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentsong.src.split("/").splice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add click event listener to the next button to play the next song
    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentsong.src.split("/").splice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add change event listener to the volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = (e.target.value) / 100;
    });

    //hamburger
    document.querySelector(".ham").addEventListener("click", ()=>{
        document.querySelector(".left").style.left=0;
    })

    //close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-100%"
    })
}

// Call the main function to start the application
main();
