document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('show');
    menuToggle.classList.toggle('open');
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
          menuToggle.classList.remove('open');
        }
      }
    });
  });

  // Guitar functionality
  function setupGuitar() {
    // Standard guitar tuning frequencies (E2, A2, D3, G3, B3, E4)
    const stringFrequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
    const fretCount = 5;
    const activeMarkers = {};
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const guitarNeck = document.querySelector('.guitar-neck');
    const strings = document.querySelectorAll('.string');
    const strumArea = document.querySelector('.strum-area');
    const strumStrings = document.querySelectorAll('.strum-string');
    
    // Create clickable fret positions
    document.querySelectorAll('.fret').forEach((fret, fretIndex) => {
      strings.forEach((string, stringIndex) => {
        const markerKey = `${stringIndex}-${fretIndex}`;
        
        fret.addEventListener('click', (e) => {
          const rect = fret.getBoundingClientRect();
          const stringRect = string.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - stringRect.top;
          
          // Only register clicks near the string
          if (Math.abs(clickY - stringRect.height/2) < 20) {
            toggleMarker(stringIndex, fretIndex, rect, stringRect);
          }
        });
      });
    });
  
    function toggleMarker(stringIndex, fretIndex, fretRect, stringRect) {
      const markerKey = `${stringIndex}-${fretIndex}`;
      const existingMarker = guitarNeck.querySelector(`[data-marker="${markerKey}"]`);
      
      if (existingMarker) {
        guitarNeck.removeChild(existingMarker);
        delete activeMarkers[markerKey];
      } else {
        createMarker(stringIndex, fretIndex, fretRect, stringRect);
      }
    }
  
    function createMarker(stringIndex, fretIndex, fretRect, stringRect) {
      const markerKey = `${stringIndex}-${fretIndex}`;
      const marker = document.createElement('div');
      marker.className = 'fret-marker';
      marker.dataset.marker = markerKey;
      
      // Position marker
      marker.style.left = `${fretRect.left + fretRect.width/2 - guitarNeck.getBoundingClientRect().left}px`;
      marker.style.top = `${stringRect.top + stringRect.height/2 - guitarNeck.getBoundingClientRect().top}px`;
      
      // Add note label
      marker.textContent = getNoteName(stringIndex, fretIndex);
      
      // Click to remove
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        guitarNeck.removeChild(marker);
        delete activeMarkers[markerKey];
      });
      
      guitarNeck.appendChild(marker);
      activeMarkers[markerKey] = true;
    }
  
    // Strumming functionality
    let isStrumming = false;
    
    strumArea.addEventListener('mousedown', startStrum);
    strumArea.addEventListener('mouseup', playCurrentNotes);
    strumArea.addEventListener('mouseleave', cancelStrum);
    strumArea.addEventListener('touchstart', startStrum);
    strumArea.addEventListener('touchend', playCurrentNotes);
  
    function startStrum(e) {
      e.preventDefault();
      isStrumming = true;
      strumArea.classList.add('strumming');
    }
  
    function cancelStrum() {
      isStrumming = false;
      strumArea.classList.remove('strumming');
    }
  
    function playCurrentNotes(e) {
      if (e) e.preventDefault();
      if (!isStrumming) return;
      
      cancelStrum();
      
      // Play each string from lowest to highest
      for (let i = 5; i >= 0; i--) {
        setTimeout(() => {
          playString(i);
        }, (5 - i) * 75);
      }
    }
  
    function playString(stringIndex) {
      let fret = 0;
      for (const key in activeMarkers) {
        const [s, f] = key.split('-').map(Number);
        if (s === stringIndex) {
          fret = f + 1;
          break;
        }
      }
    
      const baseFreq = stringFrequencies[stringIndex];
      const frequency = baseFreq * Math.pow(2, fret/12);
      
      // Create audio nodes
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Use triangle wave for pleasant but clear tone
      oscillator.type = 'triangle';
      
      // String-specific volume scaling (higher strings louder)
      const volumes = [0.4, 0.45, 0.5, 0.55, 0.6, 0.7]; // EADGBE
      
      // Set envelope
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volumes[stringIndex], now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      // Connect and play
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.start();
      oscillator.stop(now + 1.2);
    
      // Visual feedback
      strings[stringIndex].classList.add('strummed');
      strumStrings[stringIndex].classList.add('strummed');
      
      setTimeout(() => {
        strings[stringIndex].classList.remove('strummed');
        strumStrings[stringIndex].classList.remove('strummed');
      }, 150);
    }

    function playNote(frequency) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // Guitar-like envelope
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(now + 1.5);
    }
  
    function getNoteName(stringIndex, fretIndex) {
      const notes = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
      const openNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
      const openNote = openNotes[stringIndex];
      const openIndex = notes.indexOf(openNote);
      return notes[(openIndex + fretIndex + 1) % 12];
    }
  }

  // Project details modal functionality
  function setupProjectModals() {
    const modal = document.getElementById('project-details');
    const closeBtn = document.querySelector('.close-modal');
    
    // Project data
    const projects = {
      'radiation-hazard': {
        title: 'Radiation Hazard',
        description: 'A cooperative survival game set in a dangerous power plant with procedurally generated hazards and survival fun with friends.',
        images: [
          'assets/photo1-2.jpg',
          'assets/photo1-3.jpg',
          'assets/photo1.jpg'
        ],
        details: [
          'Platform: Windows',
          'Engine: Unity',
          'Key Features: Procedural generation, multiplayer, horror survival'
        ],
        videos: [
          {
            title: 'Dev Trailer',
            url: 'https://www.youtube.com/embed/2iEj8oKcJDE'
          }
        ]
      },
      'boba-bandit': {
        title: 'Boba Bandit',
        description: 'A cute and cozy game where you play as a boba tea shop owner who must deliver drinks to customers while avoiding obstacles and collecting ingredients.',
        images: [
          'assets/TempLogo.JPG'
        ],
        details: [
          'Platform: Windows, Mac',
          'Engine: Unity',
          'Team Size: 2 person project',
          'Key Features: Cozy Gameplay, Adventure, Shop Customization'
        ]
      },
      'plant-bot': {
        title: 'Plant Bot',
        description: 'A cute work in progress bot that currently checks the moisture of my soil, and will soon water my plants for me automatically.',
        images: [
          'assets/IMG_2432.jpg',
          'assets/IMG_2435.jpg',
          'assets/IMG_2437.jpg'
        ],
        details: [
          'Platform: Arduino',
          'Components: Uno R3, PIR Motion Sensor, Basic 16 Pin LCD Screen, Teensy Breadboard, Water sensor',
          'Features: simple soil monitoring :)'
        ]
      },
      'crop-hunt': {
        title: 'Crop Hunt',
        description: 'A short survival horror experience set in an corn maze with a relentless pursuer. Originally developed for a game jam the DreadXP Game Jam.',
        images: [
          'assets/photo3-2.jpg',
          'assets/photo3-3.jpg',
          'assets/photo3.jpg'
        ],
        details: [
          'Platform: Windows',
          'Engine: Unity',
          'Game Jam: DreadXP Jam',
          'Development Time: 2 Weeks',
        ],
        videos: [
          {
            title: 'Gameplay Preview',
            url: 'https://www.youtube.com/embed/2zTMPIKRx50'
          }
        ]
      },
      'fan-mail': {
        title: 'Fan Mail',
        description: 'A short horror experience made for my Intro to Creative Writing Class.',
        images: [
          'assets/IconFM.png'
        ],
        details: [
          'Platform: Windows',
          'Engine: Unity',
          'Playtime: 8 Minutes'
        ]
      }
    };

    document.querySelectorAll('.project-link.secondary').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const projectId = this.dataset.project;
        openProjectModal(projectId);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    function openProjectModal(projectId) {
      const project = projects[projectId];
      if (!project) return;

      modal.querySelector('.modal-title').textContent = project.title;
      modal.querySelector('.project-full-description').textContent = project.description;

      const thumbnailsContainer = modal.querySelector('.gallery-thumbnails');
      const detailsList = modal.querySelector('.details-list');
      const videoContainer = modal.querySelector('.video-container');
      const devLogsContainer = modal.querySelector('.dev-log-entries');
      
      // Clear previous content
      thumbnailsContainer.innerHTML = '';
      detailsList.innerHTML = '';
      videoContainer.innerHTML = '';
      devLogsContainer.innerHTML = '';

      const mainImage = modal.querySelector('#main-gallery-image');
      if (project.images && project.images.length > 0) {
        mainImage.src = project.images[0];
        mainImage.alt = project.title;
      }

      // Add thumbnails
      if (project.images && project.images.length > 1) {
        project.images.forEach((imgSrc, index) => {
          const thumb = document.createElement('img');
          thumb.src = imgSrc;
          thumb.alt = `${project.title} - Image ${index + 1}`;
          if (index === 0) thumb.classList.add('active');
          
          thumb.addEventListener('click', () => {
            mainImage.src = imgSrc;
            modal.querySelectorAll('.gallery-thumbnails img').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
          });
          
          thumbnailsContainer.appendChild(thumb);
        });
      }

      // Add project details
      if (project.details) {
        project.details.forEach(detail => {
          const li = document.createElement('li');
          li.textContent = detail;
          detailsList.appendChild(li);
        });
      }

      // Add videos
      if (project.videos && project.videos.length > 0) {
        project.videos.forEach(video => {
          const videoWrapper = document.createElement('div');
          videoWrapper.className = 'video-wrapper';
          
          const title = document.createElement('h4');
          title.textContent = video.title;
          videoWrapper.appendChild(title);
          
          const iframe = document.createElement('iframe');
          iframe.src = video.url;
          iframe.frameBorder = '0';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          videoWrapper.appendChild(iframe);
          
          videoContainer.appendChild(videoWrapper);
        });
      } else {
        videoContainer.innerHTML = '<p>No videos available for this project.</p>';
      }

      // Add dev logs
      if (project.devLogs && project.devLogs.length > 0) {
        project.devLogs.forEach(log => {
          const entry = document.createElement('div');
          entry.className = 'dev-log-entry';
          entry.innerHTML = `
            <h4><span class="log-date">${log.date}</span> - ${log.title}</h4>
            <p>${log.content}</p>
          `;
          devLogsContainer.appendChild(entry);
        });
      } else {
        devLogsContainer.innerHTML = '<p>No development logs available for this project.</p>';
      }

      // Show modal
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      const modal = document.getElementById('project-details');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      
      // Pause any videos when closing modal
      modal.querySelectorAll('iframe').forEach(iframe => {
        // Reset iframe src to stop video playback
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
      });
    }
  }

  // Initialize functionality
  setupGuitar();
  setupProjectModals();

  // Background animation
  const blobs = document.querySelectorAll('.blob');
  function animateBlobs() {
    blobs.forEach(blob => {
      const speed = parseFloat(blob.style.animationDuration) || 15;
      const now = Date.now() / (speed * 1000);
      const x = Math.sin(now) * 50;
      const y = Math.cos(now) * 50;
      blob.style.transform = `translate(${x}px, ${y}px)`;
    });
    if (blobs.length > 0) {
      requestAnimationFrame(animateBlobs);
    }
  }

  // Start animation only if blobs exist
  if (document.querySelector('.blob')) {
    animateBlobs();
  }
});