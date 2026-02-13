/**
 * bundle.js - All game code bundled for direct browser use
 * The Island of Infinitia - AP Calculus AB Adventure
 */

(function() {
    'use strict';

    // ============================================
    // PARTICLES MODULE
    // ============================================
    const Particles = (function() {
        let canvas = null;
        let ctx = null;
        let particles = [];
        let animationId = null;
        let isRunning = false;

        const colors = {
            correct: ['#4a9b6a', '#6abf8a', '#c9a84c', '#f4e4bc'],
            incorrect: ['#9b4a4a', '#bf6a6a'],
            mastery: ['#c9a84c', '#f4e4bc', '#4a9b6a', '#6ba4c9'],
            rune: ['#c9a84c', '#f4e4bc', '#ffffff', '#ffdd77']
        };

        function init() {
            canvas = document.getElementById('particle-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        function resizeCanvas() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticle(x, y, type, config) {
            config = config || {};
            const colorSet = colors[type] || colors.correct;
            const color = colorSet[Math.floor(Math.random() * colorSet.length)];

            return {
                x: x,
                y: y,
                vx: config.vx !== undefined ? config.vx : (Math.random() - 0.5) * 8,
                vy: config.vy !== undefined ? config.vy : (Math.random() - 0.5) * 8 - 2,
                life: 1,
                decay: config.decay || 0.02 + Math.random() * 0.02,
                color: color,
                size: config.size || 3 + Math.random() * 4,
                type: config.shape || 'circle',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            };
        }

        function burst(x, y, type, count) {
            count = count || 20;
            for (let i = 0; i < count; i++) {
                particles.push(createParticle(x, y, type));
            }
            startAnimation();
        }

        function sparkle(x, y, type, count) {
            count = count || 15;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
                const speed = 2 + Math.random() * 3;
                particles.push(createParticle(x, y, type, {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    size: 2 + Math.random() * 3,
                    decay: 0.015 + Math.random() * 0.01
                }));
            }
            startAnimation();
        }

        function spiral(x, y, type, duration) {
            duration = duration || 2000;
            const startTime = Date.now();
            const interval = setInterval(function() {
                const elapsed = Date.now() - startTime;
                if (elapsed > duration) {
                    clearInterval(interval);
                    return;
                }
                const progress = elapsed / duration;
                const angle = progress * Math.PI * 8;
                const radius = 50 + progress * 100;
                const px = x + Math.cos(angle) * radius * (1 - progress);
                const py = y + Math.sin(angle) * radius * (1 - progress);

                for (let i = 0; i < 3; i++) {
                    particles.push(createParticle(px, py, type, {
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: 2 + Math.random() * 4,
                        decay: 0.03 + Math.random() * 0.02
                    }));
                }
            }, 30);
            startAnimation();
        }

        function fadeParticles(x, y, type, count) {
            count = count || 10;
            for (let i = 0; i < count; i++) {
                particles.push(createParticle(x, y, type, {
                    vx: (Math.random() - 0.5) * 3,
                    vy: -1 - Math.random() * 2,
                    size: 4 + Math.random() * 6,
                    decay: 0.01 + Math.random() * 0.01
                }));
            }
            startAnimation();
        }

        function celebrationBurst(x, y) {
            for (let wave = 0; wave < 3; wave++) {
                setTimeout(function() {
                    burst(x, y, 'mastery', 25);
                    sparkle(x, y, 'mastery', 20);
                }, wave * 150);
            }
        }

        function update() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // gravity
                p.life -= p.decay;
                p.rotation += p.rotationSpeed;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);

                if (p.type === 'star') {
                    drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
                } else if (p.type === 'square') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            if (particles.length > 0) {
                animationId = requestAnimationFrame(update);
            } else {
                isRunning = false;
            }
        }

        function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
        }

        function startAnimation() {
            if (!isRunning) {
                isRunning = true;
                update();
            }
        }

        function clear() {
            particles = [];
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        return {
            init: init,
            burst: burst,
            sparkle: sparkle,
            spiral: spiral,
            fadeParticles: fadeParticles,
            celebrationBurst: celebrationBurst,
            clear: clear
        };
    })();

    // ============================================
    // MATH MODULE
    // ============================================
    const MathModule = (function() {
        const DEFAULT_TOLERANCE = 0.001;

        function cleanInput(input) {
            if (typeof input !== 'string') {
                return String(input);
            }
            return input
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/,/g, '')
                .replace(/÷/g, '/')
                .replace(/×/g, '*')
                .replace(/−/g, '-');
        }

        function evaluateExpression(expr) {
            let processed = expr
                .replace(/pi|π/g, String(Math.PI))
                .replace(/\be\b/g, String(Math.E))
                .replace(/sqrt\(([^)]+)\)/g, (_, inner) => {
                    const val = evaluateExpression(inner);
                    return String(Math.sqrt(val));
                })
                .replace(/\^/g, '**');

            const safePattern = /^[\d\.\+\-\*\/\(\)\s\e]+$/i;
            if (safePattern.test(processed)) {
                try {
                    return Function(`'use strict'; return (${processed})`)();
                } catch (e) {
                    return null;
                }
            }

            const simple = parseFloat(processed);
            if (!isNaN(simple)) {
                return simple;
            }
            return null;
        }

        function parseAnswer(input) {
            if (typeof input === 'number') {
                return input;
            }

            const cleaned = cleanInput(input);

            if (cleaned === 'dne' || cleaned === 'undefined' || cleaned === 'doesnotexist') {
                return NaN;
            }
            if (cleaned === 'infinity' || cleaned === 'inf' || cleaned === '∞') {
                return Infinity;
            }
            if (cleaned === '-infinity' || cleaned === '-inf' || cleaned === '-∞') {
                return -Infinity;
            }

            try {
                return evaluateExpression(cleaned);
            } catch (e) {
                return null;
            }
        }

        function validateAnswer(userAnswer, correctAnswer, tolerance) {
            tolerance = tolerance || DEFAULT_TOLERANCE;
            const cleaned = cleanInput(userAnswer);
            const userValue = parseAnswer(cleaned);
            if (userValue === null) {
                return false;
            }

            let correctValue;
            if (typeof correctAnswer === 'string') {
                correctValue = parseAnswer(correctAnswer);
            } else {
                correctValue = correctAnswer;
            }

            if (correctValue === null) {
                return false;
            }

            if (!isFinite(userValue) && !isFinite(correctValue)) {
                return Math.sign(userValue) === Math.sign(correctValue);
            }

            if (!isFinite(userValue) || !isFinite(correctValue)) {
                return false;
            }

            return Math.abs(userValue - correctValue) <= tolerance;
        }

        return {
            validateAnswer: validateAnswer,
            parseAnswer: parseAnswer
        };
    })();

    // ============================================
    // GAME STATE MODULE
    // ============================================
    const Game = (function() {
        const STORAGE_KEY = 'infinitia_save';
        const MASTERY_THRESHOLD = 5;

        let gameState = null;

        function createNewGameState() {
            return {
                version: 1,
                created: Date.now(),
                lastPlayed: Date.now(),
                currentRegion: null,
                currentTopic: null,
                runes: {
                    'tidal-observatory': false,
                    'clocktower': false,
                    'greenhouse': false,
                    'weather-station': false,
                    'mining-caverns': false,
                    'reservoir': false,
                    'alchemist-lab': false,
                    'architect-ruins': false
                },
                topics: {},
                stats: {
                    totalProblemsAttempted: 0,
                    totalProblemsCorrect: 0,
                    totalTopicsMastered: 0,
                    playTime: 0
                },
                hasSeenIntro: false,
                gameCompleted: false
            };
        }

        function loadFromStorage() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.error('Failed to load game:', e);
            }
            return null;
        }

        function saveToStorage() {
            try {
                gameState.lastPlayed = Date.now();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
                return true;
            } catch (e) {
                console.error('Failed to save game:', e);
                return false;
            }
        }

        function initGame() {
            const saved = loadFromStorage();
            if (saved) {
                gameState = saved;
                gameState.lastPlayed = Date.now();
            } else {
                gameState = createNewGameState();
            }
            return gameState;
        }

        function newGame() {
            gameState = createNewGameState();
            saveToStorage();
            return gameState;
        }

        function getState() {
            return gameState;
        }

        function hasSavedGame() {
            try {
                return localStorage.getItem(STORAGE_KEY) !== null;
            } catch (e) {
                return false;
            }
        }

        function clearSave() {
            try {
                localStorage.removeItem(STORAGE_KEY);
                return true;
            } catch (e) {
                return false;
            }
        }

        function getTopicProgress(topicId) {
            if (!gameState.topics[topicId]) {
                gameState.topics[topicId] = {
                    mastered: false,
                    streak: 0,
                    attempts: 0,
                    correctAnswers: 0
                };
            }
            return gameState.topics[topicId];
        }

        function recordAnswer(topicId, isCorrect) {
            const progress = getTopicProgress(topicId);
            const wasMastered = progress.mastered;

            progress.attempts++;
            gameState.stats.totalProblemsAttempted++;

            if (isCorrect) {
                progress.streak++;
                progress.correctAnswers++;
                gameState.stats.totalProblemsCorrect++;

                if (progress.streak >= MASTERY_THRESHOLD && !progress.mastered) {
                    progress.mastered = true;
                    gameState.stats.totalTopicsMastered++;
                }
            } else {
                progress.streak = 0;
            }

            saveToStorage();

            return {
                correct: isCorrect,
                streak: progress.streak,
                mastered: progress.mastered,
                justMastered: progress.mastered && !wasMastered
            };
        }

        function isTopicMastered(topicId) {
            const progress = gameState.topics[topicId];
            return progress ? progress.mastered : false;
        }

        function getTopicStreak(topicId) {
            const progress = gameState.topics[topicId];
            return progress ? progress.streak : 0;
        }

        function countMasteredTopics(topicIds) {
            return topicIds.filter(id => isTopicMastered(id)).length;
        }

        function areAllTopicsMastered(topicIds) {
            return topicIds.every(id => isTopicMastered(id));
        }

        function collectRune(regionId) {
            if (!gameState.runes[regionId]) {
                gameState.runes[regionId] = true;
                saveToStorage();
                return true;
            }
            return false;
        }

        function hasRune(regionId) {
            return gameState.runes[regionId] === true;
        }

        function countRunes() {
            return Object.values(gameState.runes).filter(v => v).length;
        }

        function hasAllRunes() {
            return countRunes() === 8;
        }

        function setCurrentRegion(regionId) {
            gameState.currentRegion = regionId;
            saveToStorage();
        }

        function setCurrentTopic(topicId) {
            gameState.currentTopic = topicId;
            saveToStorage();
        }

        function getCurrentRegion() {
            return gameState.currentRegion;
        }

        function getCurrentTopic() {
            return gameState.currentTopic;
        }

        function markIntroSeen() {
            gameState.hasSeenIntro = true;
            saveToStorage();
        }

        function hasSeenIntro() {
            return gameState.hasSeenIntro;
        }

        function markGameCompleted() {
            gameState.gameCompleted = true;
            saveToStorage();
        }

        function getStats() {
            return { ...gameState.stats };
        }

        function isRegionAvailable(regionId) {
            const availableRegions = ['tidal-observatory', 'clocktower', 'greenhouse', 'weather-station', 'mining-caverns', 'reservoir', 'alchemist-lab', 'architect-ruins'];
            return availableRegions.includes(regionId);
        }

        return {
            MASTERY_THRESHOLD: MASTERY_THRESHOLD,
            initGame: initGame,
            newGame: newGame,
            getState: getState,
            hasSavedGame: hasSavedGame,
            clearSave: clearSave,
            saveToStorage: saveToStorage,
            getTopicProgress: getTopicProgress,
            recordAnswer: recordAnswer,
            isTopicMastered: isTopicMastered,
            getTopicStreak: getTopicStreak,
            countMasteredTopics: countMasteredTopics,
            areAllTopicsMastered: areAllTopicsMastered,
            collectRune: collectRune,
            hasRune: hasRune,
            countRunes: countRunes,
            hasAllRunes: hasAllRunes,
            setCurrentRegion: setCurrentRegion,
            setCurrentTopic: setCurrentTopic,
            getCurrentRegion: getCurrentRegion,
            getCurrentTopic: getCurrentTopic,
            markIntroSeen: markIntroSeen,
            hasSeenIntro: hasSeenIntro,
            markGameCompleted: markGameCompleted,
            getStats: getStats,
            isRegionAvailable: isRegionAvailable
        };
    })();

    // ============================================
    // LOCATIONS MODULE
    // ============================================
    const Locations = (function() {
        const regions = {
            'tidal-observatory': {
                id: 'tidal-observatory',
                name: 'The Tidal Observatory',
                unit: 1,
                unitName: 'Limits and Continuity',
                icon: '🌊',
                runeSymbol: '∞',
                description: '<p>The ancient Tidal Observatory rises from the rocky shore, its brass instruments green with age. Generations of island scholars tracked the tides here, predicting the water\'s approach to precise levels.</p><p>Their secret? Understanding how values <em>approach</em> their destinations—the mathematical concept of <strong>limits</strong>.</p><p>Stone tablets line the walls, each inscribed with lessons about approaching, but never quite reaching. Study them well, and prove your understanding to claim the Rune of Infinity.</p>',
                runeMessage: 'You have mastered the art of limits—understanding how values approach their destinations. The Rune of Infinity recognizes your wisdom in comprehending the infinite.',
                topics: [
                    { id: '1.1', name: 'Introducing Calculus: Can Change Occur at an Instant?' },
                    { id: '1.2', name: 'Defining Limits and Using Limit Notation' },
                    { id: '1.3', name: 'Estimating Limit Values from Graphs' },
                    { id: '1.4', name: 'Estimating Limit Values from Tables' },
                    { id: '1.5', name: 'Determining Limits Using Algebraic Properties' },
                    { id: '1.6', name: 'Determining Limits Using Algebraic Manipulation' },
                    { id: '1.7', name: 'Selecting Procedures for Determining Limits' },
                    { id: '1.8', name: 'Determining Limits Using the Squeeze Theorem' },
                    { id: '1.9', name: 'Connecting Multiple Representations of Limits' },
                    { id: '1.10', name: 'Exploring Types of Discontinuities' },
                    { id: '1.11', name: 'Defining Continuity at a Point' },
                    { id: '1.12', name: 'Confirming Continuity over an Interval' },
                    { id: '1.13', name: 'Removing Discontinuities' },
                    { id: '1.14', name: 'Connecting Infinite Limits and Vertical Asymptotes' },
                    { id: '1.15', name: 'Connecting Limits at Infinity and Horizontal Asymptotes' },
                    { id: '1.16', name: 'Working with the Intermediate Value Theorem' }
                ]
            },
            'clocktower': {
                id: 'clocktower',
                name: 'The Clocktower',
                unit: 2,
                unitName: 'Differentiation: Definition and Fundamental Properties',
                icon: '⚙️',
                runeSymbol: '∂',
                description: '<p>The great Clocktower stands at the island\'s heart, its massive gears tracking the motion of celestial bodies.</p><p class="coming-soon"><em>This region\'s lessons are being transcribed from ancient texts. Return soon.</em></p>',
                runeMessage: 'You have learned to measure the rate of change at any instant. The Rune of Derivatives honors your mastery of differentiation.',
                topics: [
                    { id: '2.1', name: 'Defining Average and Instantaneous Rates of Change' },
                    { id: '2.2', name: 'Defining the Derivative of a Function' },
                    { id: '2.3', name: 'Estimating Derivatives of a Function at a Point' },
                    { id: '2.4', name: 'Connecting Differentiability and Continuity' },
                    { id: '2.5', name: 'Applying the Power Rule' },
                    { id: '2.6', name: 'Derivative Rules: Constant, Sum, Difference, Constant Multiple' },
                    { id: '2.7', name: 'Derivatives of cos x, sin x, e^x, and ln x' },
                    { id: '2.8', name: 'The Product Rule' },
                    { id: '2.9', name: 'The Quotient Rule' },
                    { id: '2.10', name: 'Finding Derivatives of Tangent, Cotangent, Secant, Cosecant' }
                ]
            },
            'greenhouse': {
                id: 'greenhouse',
                name: 'The Greenhouse',
                unit: 3,
                icon: '🌿',
                runeSymbol: '∘',
                description: '<p>Glass walls stretch toward the sky, encasing an impossible garden where vines intertwine in complex patterns.</p><p>Here you will master the <strong>Chain Rule</strong> for composite functions, <strong>Implicit Differentiation</strong> for tangled relationships, and the derivatives of <strong>Inverse Functions</strong>.</p>',
                topics: [
                    { id: '3.1', name: 'The Chain Rule' },
                    { id: '3.2', name: 'Implicit Differentiation' },
                    { id: '3.3', name: 'Differentiating Inverse Functions' },
                    { id: '3.4', name: 'Differentiating Inverse Trigonometric Functions' },
                    { id: '3.5', name: 'Selecting Procedures for Calculating Derivatives' },
                    { id: '3.6', name: 'Calculating Higher-Order Derivatives' }
                ]
            },
            'weather-station': {
                id: 'weather-station',
                name: 'The Weather Station',
                unit: 4,
                icon: '🌤️',
                runeSymbol: 'Δ',
                description: '<p>High on the cliffs, the Weather Station monitors the island\'s ever-changing conditions—temperature, pressure, wind speed—all quantities that change with time.</p><p>Master <strong>Related Rates</strong>, <strong>Motion Analysis</strong>, <strong>Linear Approximation</strong>, and <strong>L\'Hospital\'s Rule</strong> to understand how changing quantities are connected.</p>',
                topics: [
                    { id: '4.1', name: 'Interpreting the Meaning of the Derivative in Context' },
                    { id: '4.2', name: 'Straight-Line Motion' },
                    { id: '4.3', name: 'Rates of Change in Applied Contexts' },
                    { id: '4.4', name: 'Introduction to Related Rates' },
                    { id: '4.5', name: 'Solving Related Rates Problems' },
                    { id: '4.6', name: 'Approximating Values Using Local Linearity' },
                    { id: '4.7', name: 'Using L\'Hospital\'s Rule' }
                ]
            },
            'mining-caverns': {
                id: 'mining-caverns',
                name: 'The Mining Caverns',
                unit: 5,
                icon: '⛏️',
                runeSymbol: '⋆',
                description: '<p>Deep beneath the island, crystalline caverns hold veins of precious ore. The ancient miners sought optimal paths—maximum yield, minimum effort.</p><p>Master the <strong>Mean Value Theorem</strong>, <strong>Extrema</strong>, <strong>Concavity</strong>, and <strong>Optimization</strong> to find the richest veins and best routes.</p>',
                topics: [
                    { id: '5.1', name: 'Using the Mean Value Theorem' },
                    { id: '5.2', name: 'Extreme Value Theorem and Critical Points' },
                    { id: '5.3', name: 'Determining Intervals of Increasing/Decreasing' },
                    { id: '5.4', name: 'Using the First Derivative Test' },
                    { id: '5.5', name: 'Using the Candidates Test' },
                    { id: '5.6', name: 'Determining Concavity' },
                    { id: '5.7', name: 'Using the Second Derivative Test' },
                    { id: '5.8', name: 'Sketching Graphs' },
                    { id: '5.9', name: 'Connecting f, f\', and f\'\'' },
                    { id: '5.10', name: 'Introduction to Optimization' },
                    { id: '5.11', name: 'Solving Optimization Problems' },
                    { id: '5.12', name: 'Implicit Relations' }
                ]
            },
            'reservoir': {
                id: 'reservoir',
                name: 'The Reservoir',
                unit: 6,
                icon: '💧',
                runeSymbol: '∫',
                description: '<p>The great Reservoir collects water from across the island. Here, accumulation is everything—measuring total flow from rates of change.</p><p>Master <strong>Riemann Sums</strong>, the <strong>Fundamental Theorem of Calculus</strong>, <strong>Antiderivatives</strong>, and <strong>u-Substitution</strong> to understand how quantities accumulate.</p>',
                topics: [
                    { id: '6.1', name: 'Exploring Accumulations of Change' },
                    { id: '6.2', name: 'Approximating Areas with Riemann Sums' },
                    { id: '6.3', name: 'Riemann Sums and Definite Integrals' },
                    { id: '6.4', name: 'The Fundamental Theorem of Calculus' },
                    { id: '6.5', name: 'Interpreting Accumulation Functions' },
                    { id: '6.6', name: 'Properties of Definite Integrals' },
                    { id: '6.7', name: 'FTC and Definite Integrals' },
                    { id: '6.8', name: 'Finding Antiderivatives' },
                    { id: '6.9', name: 'Integrating Using Substitution' },
                    { id: '6.10', name: 'Long Division and Completing the Square' },
                    { id: '6.14', name: 'Selecting Antidifferentiation Techniques' }
                ]
            },
            'alchemist-lab': {
                id: 'alchemist-lab',
                name: 'The Alchemist\'s Lab',
                unit: 7,
                icon: '⚗️',
                runeSymbol: 'φ',
                description: '<p>Bubbling potions and strange apparatus fill this ancient laboratory. Here, the alchemists discovered that change itself follows patterns—differential equations.</p><p>Master <strong>Slope Fields</strong>, <strong>Separation of Variables</strong>, and <strong>Exponential Models</strong> to predict how quantities evolve over time.</p>',
                topics: [
                    { id: '7.1', name: 'Modeling with Differential Equations' },
                    { id: '7.2', name: 'Verifying Solutions' },
                    { id: '7.3', name: 'Sketching Slope Fields' },
                    { id: '7.4', name: 'Reasoning Using Slope Fields' },
                    { id: '7.6', name: 'Separation of Variables' },
                    { id: '7.7', name: 'Particular Solutions' },
                    { id: '7.8', name: 'Exponential Models' }
                ]
            },
            'architect-ruins': {
                id: 'architect-ruins',
                name: 'The Architect\'s Ruins',
                unit: 8,
                icon: '🏛️',
                runeSymbol: 'Ω',
                description: '<p>Crumbling columns and geometric foundations mark where the island\'s greatest builders once worked. Ancient blueprints reveal their secrets: they calculated volumes of curved structures, areas between sweeping arches, and the average strength of materials over varying spans.</p><p>Their monuments used rotating shapes to create perfect domes and washers to hollow grand hallways. Master these techniques of <strong>integration applications</strong> to restore the ruins and claim the final rune.</p>',
                topics: [
                    { id: '8.1', name: 'Average Value of a Function' },
                    { id: '8.2', name: 'Position, Velocity, and Acceleration' },
                    { id: '8.3', name: 'Accumulation in Applied Contexts' },
                    { id: '8.4', name: 'Area Between Curves (x)' },
                    { id: '8.5', name: 'Area Between Curves (y)' },
                    { id: '8.6', name: 'Area with Multiple Intersections' },
                    { id: '8.7', name: 'Volumes: Squares and Rectangles' },
                    { id: '8.8', name: 'Volumes: Triangles and Semicircles' },
                    { id: '8.9', name: 'Disc Method: x or y Axis' },
                    { id: '8.10', name: 'Disc Method: Other Axes' },
                    { id: '8.11', name: 'Washer Method: x or y Axis' },
                    { id: '8.12', name: 'Washer Method: Other Axes' }
                ]
            }
        };

        function getRegion(regionId) {
            return regions[regionId] || null;
        }

        function getAllRegions() {
            return Object.values(regions);
        }

        function getRegionIds() {
            return Object.keys(regions);
        }

        return {
            regions: regions,
            getRegion: getRegion,
            getAllRegions: getAllRegions,
            getRegionIds: getRegionIds
        };
    })();

    // ============================================
    // LESSONS MODULE (Unit 1 only for brevity)
    // ============================================
    const Lessons = (function() {
        const lessons = {
            '1.1': {
                id: '1.1',
                title: 'Introducing Calculus: Can Change Occur at an Instant?',
                content: '<h3>The Mystery of Instantaneous Change</h3><p>The tidal observers faced a profound question: If the water level is constantly changing, how can we measure the rate of that change at a single instant?</p><p>Consider this paradox: To calculate a rate, we need two points in time to compare. But an "instant" has no duration—it\'s a single moment. How can something change in zero time?</p><div class="definition"><strong>The Central Question of Calculus:</strong> How do we measure instantaneous rates of change when calculation seems to require an interval of time?</div><h3>Average Rate vs. Instantaneous Rate</h3><p>The ancient scholars first mastered <strong>average rates of change</strong>. If the tide rises from 2 meters to 5 meters over 3 hours, the average rate is:</p><div class="math-display">$$\\text{Average Rate} = \\frac{\\Delta h}{\\Delta t} = \\frac{5 - 2}{3} = 1 \\text{ meter per hour}$$</div><p>But this doesn\'t tell us how fast the water is rising at exactly noon.</p><h3>The Key Insight: Shrinking Intervals</h3><p>The breakthrough came from examining what happens as we shrink the time interval toward zero. This "approaching" behavior is what we call a <strong>limit</strong>.</p><div class="key-concept"><strong>The Foundation of Calculus:</strong> The instantaneous rate of change is what the average rate of change <em>approaches</em> as the time interval shrinks toward zero.</div>'
            },
            '1.2': {
                id: '1.2',
                title: 'Defining Limits and Using Limit Notation',
                content: '<h3>The Language of Approaching</h3><p>The tidal observers developed precise notation to describe how water levels approach certain heights.</p><div class="definition"><strong>Definition of a Limit:</strong> We write $$\\lim_{x \\to c} f(x) = L$$ and say "the limit of $f(x)$ as $x$ approaches $c$ equals $L$" if $f(x)$ gets arbitrarily close to $L$ as $x$ gets sufficiently close to (but not equal to) $c$.</div><h3>Understanding the Notation</h3><ul><li><strong>$\\lim$</strong> — We\'re finding a limit</li><li><strong>$x \\to c$</strong> — As $x$ approaches the value $c$</li><li><strong>$f(x)$</strong> — We examine the function\'s output</li><li><strong>$= L$</strong> — The output approaches the value $L$</li></ul><h3>One-Sided Limits</h3><div class="definition"><p><strong>Left-hand limit:</strong> $\\lim_{x \\to c^-} f(x)$ — approaching from values less than $c$</p><p><strong>Right-hand limit:</strong> $\\lim_{x \\to c^+} f(x)$ — approaching from values greater than $c$</p></div><div class="key-concept">The two-sided limit exists if and only if both one-sided limits exist and are equal.</div>'
            },
            '1.3': {
                id: '1.3',
                title: 'Estimating Limit Values from Graphs',
                content: '<h3>Reading Limits from Visual Records</h3><p>To find $\\lim_{x \\to c} f(x)$ from a graph:</p><ol><li>Locate $x = c$ on the horizontal axis</li><li>Trace the curve from the left, noting where the $y$-value heads</li><li>Trace the curve from the right, noting where the $y$-value heads</li><li>If both sides approach the same $y$-value, that\'s the limit</li></ol><h3>Interactive Exploration</h3><p>Drag the point to see how $f(x)$ values change as $x$ approaches 2. Notice the function has a <em>hole</em> at $x = 2$, but the limit still exists!</p><div class="limit-visualizer" data-function="rational" data-limit-point="2" data-limit-value="4"><canvas width="600" height="300"></canvas></div><div class="key-concept"><strong>Remember:</strong> Look at where the curve is <em>heading</em>, not where it actually is at $x = c$. A hole in the graph doesn\'t prevent a limit from existing!</div><h3>Cases to Recognize</h3><ul><li><strong>Continuous:</strong> Curve passes smoothly through—limit equals function value</li><li><strong>Hole:</strong> Open circle but same height from both sides—limit exists</li><li><strong>Jump:</strong> Left and right limits differ—two-sided limit DNE</li><li><strong>Asymptote:</strong> Curve approaches infinity—limit is $\\pm\\infty$ or DNE</li></ul>'
            },
            '1.4': {
                id: '1.4',
                title: 'Estimating Limit Values from Tables',
                content: '<h3>Numerical Evidence for Limits</h3><p>To estimate $\\lim_{x \\to c} f(x)$ using a table:</p><ol><li>Calculate $f(x)$ for values approaching $c$ from the left</li><li>Calculate $f(x)$ for values approaching $c$ from the right</li><li>Observe what value $f(x)$ appears to approach</li></ol><div class="example"><div class="example-header">Example</div><p>For $f(x) = \\frac{x^2 - 4}{x - 2}$ near $x = 2$:</p><p>$f(1.9) = 3.9$, $f(1.99) = 3.99$, $f(2.01) = 4.01$, $f(2.1) = 4.1$</p><p>Both sides approach 4, so we estimate the limit is 4.</p></div><div class="key-concept"><strong>Caution:</strong> Tables provide estimates, not proofs. The function could behave unexpectedly between tested values.</div>'
            },
            '1.5': {
                id: '1.5',
                title: 'Determining Limits Using Algebraic Properties',
                content: '<h3>The Laws of Limits</h3><div class="definition"><strong>Basic Limit Laws:</strong> If $\\lim_{x \\to c} f(x) = L$ and $\\lim_{x \\to c} g(x) = M$, then:</div><div class="math-display"><p><strong>Sum:</strong> $\\lim [f(x) + g(x)] = L + M$</p><p><strong>Product:</strong> $\\lim [f(x) \\cdot g(x)] = L \\cdot M$</p><p><strong>Quotient:</strong> $\\lim \\frac{f(x)}{g(x)} = \\frac{L}{M}$ (if $M \\neq 0$)</p><p><strong>Power:</strong> $\\lim [f(x)]^n = L^n$</p></div><h3>Direct Substitution</h3><div class="definition"><strong>Direct Substitution Property:</strong> For polynomials and many "nice" functions: $\\lim_{x \\to c} f(x) = f(c)$ (if $f(c)$ is defined)</div><div class="example"><div class="example-header">Example</div><p>$\\lim_{x \\to 3} (2x^2 - 5x + 1) = 2(9) - 15 + 1 = 4$</p></div>'
            },
            '1.6': {
                id: '1.6',
                title: 'Determining Limits Using Algebraic Manipulation',
                content: '<h3>Resolving Indeterminate Forms</h3><p>When direct substitution yields $\\frac{0}{0}$, we need algebraic techniques.</p><h3>Technique 1: Factoring</h3><div class="animated-example" data-steps="4"><div class="example-problem">Find $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$</div><div class="example-step" data-step="1"><strong>Step 1:</strong> Direct substitution gives $\\frac{0}{0}$ (indeterminate)</div><div class="example-step" data-step="2"><strong>Step 2:</strong> Factor the numerator: $\\frac{(x-2)(x+2)}{x-2}$</div><div class="example-step" data-step="3"><strong>Step 3:</strong> Cancel common factors: $x + 2$ (valid since $x \\neq 2$)</div><div class="example-step" data-step="4"><strong>Step 4:</strong> Evaluate: $\\lim_{x \\to 2}(x+2) = 2 + 2 = 4$</div><button class="reveal-step-btn">Reveal Next Step</button></div><h3>Technique 2: Rationalizing</h3><div class="animated-example" data-steps="4"><div class="example-problem">Find $\\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x}$</div><div class="example-step" data-step="1"><strong>Step 1:</strong> Multiply by conjugate: $\\frac{\\sqrt{x+4} - 2}{x} \\cdot \\frac{\\sqrt{x+4} + 2}{\\sqrt{x+4} + 2}$</div><div class="example-step" data-step="2"><strong>Step 2:</strong> Simplify numerator: $\\frac{(x+4) - 4}{x(\\sqrt{x+4} + 2)} = \\frac{x}{x(\\sqrt{x+4} + 2)}$</div><div class="example-step" data-step="3"><strong>Step 3:</strong> Cancel $x$: $\\frac{1}{\\sqrt{x+4} + 2}$</div><div class="example-step" data-step="4"><strong>Step 4:</strong> Evaluate: $\\frac{1}{\\sqrt{4} + 2} = \\frac{1}{4}$</div><button class="reveal-step-btn">Reveal Next Step</button></div><h3>Technique 3: Common Denominators</h3><p>Combine complex fractions before evaluating.</p>'
            },
            '1.7': {
                id: '1.7',
                title: 'Selecting Procedures for Determining Limits',
                content: '<h3>The Decision Tree</h3><div class="definition"><strong>Step 1: Try Direct Substitution</strong><ul><li>Finite number → that\'s your answer</li><li>$\\frac{0}{0}$ → use algebraic manipulation</li><li>$\\frac{\\text{nonzero}}{0}$ → limit is $\\pm\\infty$ or DNE</li></ul></div><div class="definition"><strong>Step 2: For $\\frac{0}{0}$, choose:</strong><ul><li>Polynomial/rational → Factor and cancel</li><li>Square roots → Rationalize</li><li>Complex fractions → Common denominators</li><li>Trig functions → Special trig limits</li></ul></div><h3>Special Trig Limits (Memorize!)</h3><div class="key-concept"><p>$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$</p><p>$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0$</p></div>'
            },
            '1.8': {
                id: '1.8',
                title: 'Determining Limits Using the Squeeze Theorem',
                content: '<h3>The Squeeze Theorem</h3><div class="definition"><strong>Squeeze Theorem:</strong> If $g(x) \\leq f(x) \\leq h(x)$ near $c$, and $\\lim_{x \\to c} g(x) = \\lim_{x \\to c} h(x) = L$, then $\\lim_{x \\to c} f(x) = L$</div><div class="example"><div class="example-header">Example</div><p>Find $\\lim_{x \\to 0} x^2 \\sin(\\frac{1}{x})$</p><p>Since $-1 \\leq \\sin(\\frac{1}{x}) \\leq 1$: $-x^2 \\leq x^2\\sin(\\frac{1}{x}) \\leq x^2$</p><p>Both bounds → 0, so by Squeeze Theorem, limit = 0</p></div><div class="key-concept"><strong>Key Bounds:</strong> $-1 \\leq \\sin(\\cdot) \\leq 1$ and $-1 \\leq \\cos(\\cdot) \\leq 1$</div>'
            },
            '1.9': {
                id: '1.9',
                title: 'Connecting Multiple Representations of Limits',
                content: '<h3>Three Perspectives</h3><ul><li><strong>Graphical:</strong> Where does the curve head?</li><li><strong>Numerical:</strong> What do table values approach?</li><li><strong>Analytical:</strong> What does algebra reveal?</li></ul><div class="example"><div class="example-header">Example</div><p>For $f(x) = \\frac{|x-2|}{x-2}$:</p><p>Algebraically: For $x > 2$: $f(x) = 1$. For $x < 2$: $f(x) = -1$.</p><p>Graphically: Horizontal lines at $y = 1$ and $y = -1$</p><p>Conclusion: $\\lim_{x \\to 2}$ DNE (one-sided limits differ)</p></div><div class="key-concept">Use multiple representations to verify your answer!</div>'
            },
            '1.10': {
                id: '1.10',
                title: 'Exploring Types of Discontinuities',
                content: '<h3>Three Types of Discontinuities</h3><div class="definition"><strong>1. Removable (Hole):</strong> Limit exists, but $f(c)$ undefined or $f(c) \\neq$ limit</div><div class="definition"><strong>2. Jump:</strong> One-sided limits exist but differ</div><div class="definition"><strong>3. Infinite:</strong> At least one one-sided limit is $\\pm\\infty$</div><div class="example"><div class="example-header">Examples</div><p>Removable: $\\frac{x^2-1}{x-1}$ at $x=1$</p><p>Jump: $\\lfloor x \\rfloor$ at integers</p><p>Infinite: $\\frac{1}{x}$ at $x=0$</p></div>'
            },
            '1.11': {
                id: '1.11',
                title: 'Defining Continuity at a Point',
                content: '<h3>The Definition of Continuity</h3><div class="definition"><strong>Definition:</strong> $f$ is continuous at $x = c$ if:<ol><li>$f(c)$ is defined</li><li>$\\lim_{x \\to c} f(x)$ exists</li><li>$\\lim_{x \\to c} f(x) = f(c)$</li></ol></div><h3>Functions Known to Be Continuous</h3><div class="key-concept"><ul><li>Polynomials (everywhere)</li><li>Rational functions (where defined)</li><li>$\\sin x$, $\\cos x$ (everywhere)</li><li>$e^x$ (everywhere), $\\ln x$ (on domain)</li></ul></div>'
            },
            '1.12': {
                id: '1.12',
                title: 'Confirming Continuity over an Interval',
                content: '<h3>Continuity on Intervals</h3><div class="definition"><strong>Closed Interval $[a,b]$:</strong> $f$ is continuous if:<ol><li>Continuous on $(a, b)$</li><li>$\\lim_{x \\to a^+} f(x) = f(a)$</li><li>$\\lim_{x \\to b^-} f(x) = f(b)$</li></ol></div><h3>Piecewise Functions</h3><p>Check continuity at the boundary points where pieces meet.</p><div class="example"><div class="example-header">Example</div><p>For $f(x) = \\begin{cases} 2x & x \\leq 1 \\\\ x + 1 & x > 1 \\end{cases}$:</p><p>At $x = 1$: Left limit = 2, Right limit = 2, $f(1) = 2$ ✓ Continuous</p></div>'
            },
            '1.13': {
                id: '1.13',
                title: 'Removing Discontinuities',
                content: '<h3>Fixing Removable Discontinuities</h3><div class="definition">A discontinuity is removable if $\\lim_{x \\to c} f(x)$ exists. Fix it by defining $f(c) =$ the limit.</div><div class="example"><div class="example-header">Example</div><p>$f(x) = \\frac{x^2-9}{x-3}$ at $x = 3$:</p><p>Limit = 6, so define $f(3) = 6$ to make continuous.</p></div><div class="example"><div class="example-header">Finding k for continuity</div><p>For $f(x) = \\begin{cases} ax^2 & x \\leq 1 \\\\ 4x - 2 & x > 1 \\end{cases}$:</p><p>Need $a(1)^2 = 4(1) - 2$, so $a = 2$</p></div>'
            },
            '1.14': {
                id: '1.14',
                title: 'Connecting Infinite Limits and Vertical Asymptotes',
                content: '<h3>Vertical Asymptotes</h3><div class="definition"><strong>Vertical Asymptote:</strong> $x = c$ is a VA if $\\lim_{x \\to c^+}$ or $\\lim_{x \\to c^-}$ is $\\pm\\infty$</div><h3>Finding Vertical Asymptotes</h3><p>For $\\frac{p(x)}{q(x)}$: Find where $q(x) = 0$ and $p(x) \\neq 0$</p><div class="example"><div class="example-header">Example</div><p>$f(x) = \\frac{1}{x-3}$:</p><p>VA at $x = 3$</p><p>$\\lim_{x \\to 3^+} = +\\infty$ (small positive denominator)</p><p>$\\lim_{x \\to 3^-} = -\\infty$ (small negative denominator)</p></div>'
            },
            '1.15': {
                id: '1.15',
                title: 'Connecting Limits at Infinity and Horizontal Asymptotes',
                content: '<h3>End Behavior</h3><div class="definition"><strong>Horizontal Asymptote:</strong> $y = L$ is a HA if $\\lim_{x \\to \\pm\\infty} f(x) = L$</div><h3>Rational Functions at Infinity</h3><div class="key-concept">For $\\frac{a_nx^n + ...}{b_mx^m + ...}$:<ul><li>$n < m$: HA at $y = 0$</li><li>$n = m$: HA at $y = \\frac{a_n}{b_m}$</li><li>$n > m$: No HA</li></ul></div><div class="example"><div class="example-header">Example</div><p>$\\lim_{x \\to \\infty} \\frac{3x^2 + 1}{5x^2 - 2} = \\frac{3}{5}$ (equal degrees)</p></div>'
            },
            '1.16': {
                id: '1.16',
                title: 'Working with the Intermediate Value Theorem',
                content: '<h3>The Intermediate Value Theorem</h3><div class="definition"><strong>IVT:</strong> If $f$ is continuous on $[a, b]$ and $k$ is between $f(a)$ and $f(b)$, then there exists $c$ in $(a, b)$ where $f(c) = k$.</div><h3>Using IVT to Find Roots</h3><div class="example"><div class="example-header">Example</div><p>Show $x^3 + x - 1 = 0$ has a solution in $(0, 1)$:</p><ol><li>$f(x) = x^3 + x - 1$ is continuous (polynomial)</li><li>$f(0) = -1 < 0$</li><li>$f(1) = 1 > 0$</li><li>Since $f(0) < 0 < f(1)$, by IVT there exists $c$ where $f(c) = 0$</li></ol></div><div class="key-concept"><strong>IVT Requirements:</strong> Function must be continuous, and target value must be between $f(a)$ and $f(b)$.</div>'
            },
            // ========== UNIT 2: DIFFERENTIATION ==========
            '2.1': {
                id: '2.1',
                title: 'Defining Average and Instantaneous Rates of Change',
                content: '<h3>Rates of Change</h3><p>The Clocktower\'s astronomers tracked celestial movements by measuring how positions changed over time.</p><div class="definition"><strong>Average Rate of Change:</strong> $$\\frac{f(b) - f(a)}{b - a}$$</div><div class="definition"><strong>Instantaneous Rate of Change:</strong> $$\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$$</div><p>The instantaneous rate is the limit of average rates as the interval shrinks to zero.</p><div class="example"><div class="example-header">Example</div><p>For $f(x) = x^2$ at $x = 3$:</p><p>Instantaneous rate $= \\lim_{h \\to 0} \\frac{(3+h)^2 - 9}{h} = \\lim_{h \\to 0} \\frac{6h + h^2}{h} = 6$</p></div>'
            },
            '2.2': {
                id: '2.2',
                title: 'Defining the Derivative of a Function',
                content: '<h3>The Derivative</h3><div class="definition"><strong>Definition:</strong> The derivative of $f$ at $x = a$ is $$f\'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$$ if this limit exists.</div><p>Alternative notation: $\\frac{dy}{dx}$, $\\frac{df}{dx}$, $Df(x)$</p><div class="key-concept"><strong>Geometric Meaning:</strong> $f\'(a)$ is the slope of the tangent line to $y = f(x)$ at $x = a$.</div><h3>Interactive Exploration</h3><p>Drag along the curve to see the tangent line and its slope at each point. Notice how the slope changes!</p><div class="derivative-grapher" data-function="quadratic" data-show-derivative="false"><canvas width="600" height="300"></canvas><div class="visualizer-controls"><button class="toggle-derivative-btn">Toggle f\'(x) curve</button></div></div><div class="example"><div class="example-header">Example</div><p>Find $f\'(x)$ for $f(x) = x^2$:</p><p>$f\'(x) = \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h} = \\lim_{h \\to 0} \\frac{2xh + h^2}{h} = 2x$</p></div>'
            },
            '2.3': {
                id: '2.3',
                title: 'Estimating Derivatives of a Function at a Point',
                content: '<h3>Estimating Derivatives</h3><p>We can estimate $f\'(a)$ using:</p><ul><li><strong>Graphically:</strong> Estimate the slope of the tangent line</li><li><strong>Numerically:</strong> Calculate $\\frac{f(a+h) - f(a)}{h}$ for small $h$</li></ul><div class="definition"><strong>Symmetric Difference Quotient:</strong> $$f\'(a) \\approx \\frac{f(a+h) - f(a-h)}{2h}$$ Often more accurate than one-sided estimate.</div><div class="example"><div class="example-header">Example</div><p>Estimate $f\'(2)$ if $f(1.9) = 3.61$, $f(2.1) = 4.41$:</p><p>$f\'(2) \\approx \\frac{4.41 - 3.61}{0.2} = \\frac{0.8}{0.2} = 4$</p></div>'
            },
            '2.4': {
                id: '2.4',
                title: 'Connecting Differentiability and Continuity',
                content: '<h3>Differentiability and Continuity</h3><div class="key-concept"><strong>Key Theorem:</strong> If $f$ is differentiable at $a$, then $f$ is continuous at $a$.</div><p>The converse is FALSE: continuous does not imply differentiable.</p><h3>Where Functions Fail to be Differentiable</h3><ul><li><strong>Corners:</strong> $f(x) = |x|$ at $x = 0$</li><li><strong>Cusps:</strong> $f(x) = x^{2/3}$ at $x = 0$</li><li><strong>Vertical tangents:</strong> $f(x) = \\sqrt[3]{x}$ at $x = 0$</li><li><strong>Discontinuities:</strong> Any discontinuity</li></ul><div class="example"><div class="example-header">Example</div><p>$f(x) = |x|$ is continuous everywhere but not differentiable at $x = 0$ (corner).</p></div>'
            },
            '2.5': {
                id: '2.5',
                title: 'Applying the Power Rule',
                content: '<h3>The Power Rule</h3><div class="definition"><strong>Power Rule:</strong> If $f(x) = x^n$, then $$f\'(x) = nx^{n-1}$$</div><p>This works for any real exponent $n$.</p><div class="example"><div class="example-header">Examples</div><ul><li>$\\frac{d}{dx}(x^5) = 5x^4$</li><li>$\\frac{d}{dx}(x^{-2}) = -2x^{-3}$</li><li>$\\frac{d}{dx}(\\sqrt{x}) = \\frac{d}{dx}(x^{1/2}) = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$</li><li>$\\frac{d}{dx}(x) = 1$</li><li>$\\frac{d}{dx}(1) = 0$ (constant)</li></ul></div>'
            },
            '2.6': {
                id: '2.6',
                title: 'Derivative Rules: Constant, Sum, Difference, Constant Multiple',
                content: '<h3>Basic Derivative Rules</h3><div class="definition"><strong>Constant Rule:</strong> $\\frac{d}{dx}(c) = 0$</div><div class="definition"><strong>Constant Multiple:</strong> $\\frac{d}{dx}[cf(x)] = c \\cdot f\'(x)$</div><div class="definition"><strong>Sum Rule:</strong> $\\frac{d}{dx}[f(x) + g(x)] = f\'(x) + g\'(x)$</div><div class="definition"><strong>Difference Rule:</strong> $\\frac{d}{dx}[f(x) - g(x)] = f\'(x) - g\'(x)$</div><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}(3x^4 - 5x^2 + 2x - 7)$</p><p>$= 3(4x^3) - 5(2x) + 2(1) - 0 = 12x^3 - 10x + 2$</p></div>'
            },
            '2.7': {
                id: '2.7',
                title: 'Derivatives of cos x, sin x, e^x, and ln x',
                content: '<h3>Derivatives of Transcendental Functions</h3><div class="definition"><strong>Trigonometric:</strong><ul><li>$\\frac{d}{dx}(\\sin x) = \\cos x$</li><li>$\\frac{d}{dx}(\\cos x) = -\\sin x$</li></ul></div><div class="definition"><strong>Exponential and Logarithmic:</strong><ul><li>$\\frac{d}{dx}(e^x) = e^x$</li><li>$\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$</li></ul></div><div class="key-concept"><strong>Memory Aid:</strong> $e^x$ is its own derivative! And $\\sin$ and $\\cos$ cycle through each other (with a sign change for $\\cos$).</div><div class="example"><div class="example-header">Example</div><p>$\\frac{d}{dx}(3\\sin x + 2e^x) = 3\\cos x + 2e^x$</p></div>'
            },
            '2.8': {
                id: '2.8',
                title: 'The Product Rule',
                content: '<h3>The Product Rule</h3><div class="definition"><strong>Product Rule:</strong> If $h(x) = f(x) \\cdot g(x)$, then $$h\'(x) = f\'(x)g(x) + f(x)g\'(x)$$</div><p>Memory aid: "First times derivative of second, plus second times derivative of first."</p><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}(x^2 \\sin x)$</p><p>Let $f = x^2$, $g = \\sin x$</p><p>$= (2x)(\\sin x) + (x^2)(\\cos x) = 2x\\sin x + x^2\\cos x$</p></div><div class="key-concept"><strong>Common Error:</strong> $(fg)\' \\neq f\' \\cdot g\'$. You must use the product rule!</div>'
            },
            '2.9': {
                id: '2.9',
                title: 'The Quotient Rule',
                content: '<h3>The Quotient Rule</h3><div class="definition"><strong>Quotient Rule:</strong> If $h(x) = \\frac{f(x)}{g(x)}$, then $$h\'(x) = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}$$</div><p>Memory aid: "Low d-high minus high d-low, over low squared."</p><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}\\left(\\frac{x^2}{\\cos x}\\right)$</p><p>$= \\frac{(2x)(\\cos x) - (x^2)(-\\sin x)}{\\cos^2 x}$</p><p>$= \\frac{2x\\cos x + x^2\\sin x}{\\cos^2 x}$</p></div>'
            },
            '2.10': {
                id: '2.10',
                title: 'Finding Derivatives of Tangent, Cotangent, Secant, Cosecant',
                content: '<h3>Derivatives of Other Trig Functions</h3><div class="definition"><ul><li>$\\frac{d}{dx}(\\tan x) = \\sec^2 x$</li><li>$\\frac{d}{dx}(\\cot x) = -\\csc^2 x$</li><li>$\\frac{d}{dx}(\\sec x) = \\sec x \\tan x$</li><li>$\\frac{d}{dx}(\\csc x) = -\\csc x \\cot x$</li></ul></div><p>These can be derived using the quotient rule on $\\frac{\\sin x}{\\cos x}$, etc.</p><div class="example"><div class="example-header">Deriving $\\frac{d}{dx}(\\tan x)$</div><p>$\\frac{d}{dx}\\left(\\frac{\\sin x}{\\cos x}\\right) = \\frac{\\cos x \\cdot \\cos x - \\sin x(-\\sin x)}{\\cos^2 x}$</p><p>$= \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x$</p></div>'
            },
            // ========== UNIT 3: ADVANCED DIFFERENTIATION ==========
            '3.1': {
                id: '3.1',
                title: 'The Chain Rule',
                content: '<h3>The Chain Rule</h3><p>In the Greenhouse, vines intertwine—each plant\'s growth depends on another. So too with composite functions.</p><div class="definition"><strong>Chain Rule:</strong> If $y = f(g(x))$, then $$\\frac{dy}{dx} = f\'(g(x)) \\cdot g\'(x)$$</div><p>Or in Leibniz notation: $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$</p><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}(\\sin(x^2))$</p><p>Outer: $\\sin(u)$, Inner: $u = x^2$</p><p>$= \\cos(x^2) \\cdot 2x = 2x\\cos(x^2)$</p></div><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}(e^{3x})$</p><p>$= e^{3x} \\cdot 3 = 3e^{3x}$</p></div><div class="key-concept"><strong>Process:</strong> Differentiate the outer function (keeping inner intact), then multiply by the derivative of the inner.</div>'
            },
            '3.2': {
                id: '3.2',
                title: 'Implicit Differentiation',
                content: '<h3>Implicit Differentiation</h3><p>Some relationships in the Greenhouse cannot be written as $y = f(x)$. Vines twist around each other, their positions defined implicitly.</p><div class="definition"><strong>Implicit Differentiation:</strong> When $y$ is defined implicitly by an equation, differentiate both sides with respect to $x$, treating $y$ as a function of $x$.</div><div class="key-concept">When differentiating a term with $y$, apply the chain rule: $\\frac{d}{dx}(y^2) = 2y \\cdot \\frac{dy}{dx}$</div><div class="example"><div class="example-header">Example</div><p>Find $\\frac{dy}{dx}$ if $x^2 + y^2 = 25$</p><p>Differentiate: $2x + 2y\\frac{dy}{dx} = 0$</p><p>Solve: $\\frac{dy}{dx} = -\\frac{x}{y}$</p></div><div class="example"><div class="example-header">Example</div><p>Find $\\frac{dy}{dx}$ if $xy = 1$</p><p>Product rule: $y + x\\frac{dy}{dx} = 0$</p><p>$\\frac{dy}{dx} = -\\frac{y}{x}$</p></div>'
            },
            '3.3': {
                id: '3.3',
                title: 'Differentiating Inverse Functions',
                content: '<h3>Derivatives of Inverse Functions</h3><p>If a function and its inverse are like mirror images, their derivatives have a special relationship.</p><div class="definition"><strong>Inverse Function Derivative:</strong> If $g = f^{-1}$, then $$g\'(x) = \\frac{1}{f\'(g(x))}$$</div><div class="key-concept">Equivalently: If $y = f^{-1}(x)$, then $\\frac{dy}{dx} = \\frac{1}{f\'(y)}$</div><div class="example"><div class="example-header">Example</div><p>If $f(x) = x^3$ and $g = f^{-1}$, find $g\'(8)$.</p><p>$f\'(x) = 3x^2$</p><p>$g(8) = 2$ (since $f(2) = 8$)</p><p>$g\'(8) = \\frac{1}{f\'(2)} = \\frac{1}{12}$</p></div><div class="definition"><strong>Logarithm Derivative:</strong> $$\\frac{d}{dx}(\\log_a x) = \\frac{1}{x \\ln a}$$</div>'
            },
            '3.4': {
                id: '3.4',
                title: 'Differentiating Inverse Trigonometric Functions',
                content: '<h3>Inverse Trig Derivatives</h3><div class="definition"><strong>Key Inverse Trig Derivatives:</strong><ul><li>$\\frac{d}{dx}(\\arcsin x) = \\frac{1}{\\sqrt{1-x^2}}$</li><li>$\\frac{d}{dx}(\\arccos x) = \\frac{-1}{\\sqrt{1-x^2}}$</li><li>$\\frac{d}{dx}(\\arctan x) = \\frac{1}{1+x^2}$</li></ul></div><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}(\\arctan(2x))$</p><p>Chain rule: $\\frac{1}{1+(2x)^2} \\cdot 2 = \\frac{2}{1+4x^2}$</p></div><div class="example"><div class="example-header">Example</div><p>Find $\\frac{d}{dx}(\\arcsin(x^2))$</p><p>$= \\frac{1}{\\sqrt{1-(x^2)^2}} \\cdot 2x = \\frac{2x}{\\sqrt{1-x^4}}$</p></div><div class="key-concept">Note: $\\sin^{-1}x$ means $\\arcsin x$, NOT $\\frac{1}{\\sin x}$!</div>'
            },
            '3.5': {
                id: '3.5',
                title: 'Selecting Procedures for Calculating Derivatives',
                content: '<h3>Choosing the Right Technique</h3><p>The Greenhouse gardener must select the right tool for each plant. Similarly, choose the appropriate differentiation technique.</p><div class="definition"><strong>Decision Guide:</strong><ul><li><strong>Single function:</strong> Use basic rules (power, trig, exponential, log)</li><li><strong>Product of functions:</strong> Product rule</li><li><strong>Quotient of functions:</strong> Quotient rule (or rewrite as product)</li><li><strong>Composition:</strong> Chain rule</li><li><strong>Implicit equation:</strong> Implicit differentiation</li><li><strong>Multiple techniques:</strong> Combine as needed</li></ul></div><div class="example"><div class="example-header">Example</div><p>$\\frac{d}{dx}(x^2 e^{\\sin x})$ needs:</p><p>• Product rule for $x^2 \\cdot e^{\\sin x}$</p><p>• Chain rule for $e^{\\sin x}$</p></div><div class="key-concept">Always identify ALL functions and operations before starting!</div>'
            },
            '3.6': {
                id: '3.6',
                title: 'Calculating Higher-Order Derivatives',
                content: '<h3>Higher-Order Derivatives</h3><p>Some plants in the Greenhouse grow in cycles—their rate of change itself changes. This leads to second and higher derivatives.</p><div class="definition"><strong>Notation:</strong><ul><li>First derivative: $f\'(x)$, $\\frac{dy}{dx}$</li><li>Second derivative: $f\'\'(x)$, $\\frac{d^2y}{dx^2}$</li><li>Third derivative: $f\'\'\'(x)$, $\\frac{d^3y}{dx^3}$</li><li>$n$th derivative: $f^{(n)}(x)$, $\\frac{d^ny}{dx^n}$</li></ul></div><div class="example"><div class="example-header">Example</div><p>Find $f\'\'(x)$ if $f(x) = x^4 - 3x^2 + 5$</p><p>$f\'(x) = 4x^3 - 6x$</p><p>$f\'\'(x) = 12x^2 - 6$</p></div><div class="key-concept"><strong>Physical Meaning:</strong><ul><li>$s(t)$ = position</li><li>$s\'(t) = v(t)$ = velocity</li><li>$s\'\'(t) = a(t)$ = acceleration</li></ul></div>'
            },
            // ========== UNIT 4: CONTEXTUAL APPLICATIONS ==========
            '4.1': {
                id: '4.1',
                title: 'Interpreting the Meaning of the Derivative in Context',
                content: '<h3>Derivatives in Context</h3><p>At the Weather Station, measurements mean something: temperature, pressure, wind speed. The derivative tells us how fast these quantities change.</p><div class="definition"><strong>Interpretation:</strong> If $f(t)$ represents a quantity at time $t$, then $f\'(t)$ is the <em>rate of change</em> of that quantity with respect to time.</div><div class="example"><div class="example-header">Example</div><p>If $T(t)$ is temperature (°F) at time $t$ (hours), and $T\'(3) = -2$:</p><p>"At $t = 3$ hours, the temperature is decreasing at a rate of 2°F per hour."</p></div><div class="key-concept"><strong>Units:</strong> If $f$ has units of $A$ and $x$ has units of $B$, then $f\'$ has units of $\\frac{A}{B}$.</div><div class="example"><div class="example-header">Example</div><p>If $P(t)$ = population at year $t$ and $P\'(2020) = 5000$:</p><p>"In 2020, the population was increasing by 5000 people per year."</p></div>'
            },
            '4.2': {
                id: '4.2',
                title: 'Straight-Line Motion',
                content: '<h3>Straight-Line Motion</h3><p>Weather balloons rise and fall along straight paths. Position, velocity, and acceleration are connected by derivatives.</p><div class="definition"><strong>Motion Relationships:</strong><ul><li>Position: $s(t)$</li><li>Velocity: $v(t) = s\'(t)$</li><li>Acceleration: $a(t) = v\'(t) = s\'\'(t)$</li></ul></div><div class="key-concept"><strong>Direction of Motion:</strong><ul><li>$v(t) > 0$: moving in positive direction</li><li>$v(t) < 0$: moving in negative direction</li><li>$v(t) = 0$: momentarily at rest</li></ul></div><div class="definition"><strong>Speed vs Velocity:</strong> Speed $= |v(t)|$ (always non-negative)</div><div class="example"><div class="example-header">Example</div><p>If $s(t) = t^3 - 6t^2 + 9t$:</p><p>$v(t) = 3t^2 - 12t + 9 = 3(t-1)(t-3)$</p><p>Object at rest when $t = 1$ or $t = 3$</p></div>'
            },
            '4.3': {
                id: '4.3',
                title: 'Rates of Change in Applied Contexts',
                content: '<h3>Applied Rates of Change</h3><p>At the Weather Station, every reading has meaning—and every derivative tells a story about change.</p><div class="example"><div class="example-header">Example: Pressure</div><p>If $P(h) = 101.3e^{-0.00012h}$ kPa at height $h$ meters:</p><p>$P\'(h) = -0.0121e^{-0.00012h}$ kPa/meter</p><p>At $h = 1000$m: $P\'(1000) \\approx -0.0107$ kPa/m</p><p>Interpretation: Pressure decreases by about 0.0107 kPa per meter.</p></div><div class="key-concept"><strong>Reading Derivatives:</strong><ul><li>Positive derivative: quantity increasing</li><li>Negative derivative: quantity decreasing</li><li>Large $|f\'|$: rapid change</li><li>Small $|f\'|$: gradual change</li></ul></div>'
            },
            '4.4': {
                id: '4.4',
                title: 'Introduction to Related Rates',
                content: '<h3>Related Rates</h3><p>When storm clouds approach, multiple measurements change simultaneously—and their rates are connected.</p><div class="definition"><strong>Related Rates:</strong> When two or more quantities are related by an equation and each changes with time, their rates of change are also related.</div><div class="example"><div class="example-header">Setup</div><p>A weather balloon rises. Its height $h$ and distance $d$ from observer are related by $d^2 = h^2 + 100^2$.</p><p>Differentiating with respect to time:</p><p>$2d\\frac{dd}{dt} = 2h\\frac{dh}{dt}$</p></div><div class="key-concept"><strong>Key Steps:</strong><ol><li>Draw diagram, label variables</li><li>Write equation relating variables</li><li>Differentiate both sides with respect to $t$</li><li>Substitute known values and solve</li></ol></div>'
            },
            '4.5': {
                id: '4.5',
                title: 'Solving Related Rates Problems',
                content: '<h3>Related Rates: Worked Examples</h3><div class="example"><div class="example-header">Example: Expanding Storm</div><p>A circular storm expands so radius increases at 5 km/hr. How fast is area increasing when radius is 10 km?</p><p><strong>Equation:</strong> $A = \\pi r^2$</p><p><strong>Differentiate:</strong> $\\frac{dA}{dt} = 2\\pi r \\frac{dr}{dt}$</p><p><strong>Substitute:</strong> $\\frac{dA}{dt} = 2\\pi(10)(5) = 100\\pi$ km²/hr</p></div><div class="example"><div class="example-header">Example: Ladder</div><p>A 10-ft ladder slides down. Base moves at 1 ft/s. How fast does top slide when base is 6 ft out?</p><p>$x^2 + y^2 = 100$; when $x = 6$, $y = 8$</p><p>$\\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt} = -\\frac{6}{8}(1) = -0.75$ ft/s</p></div>'
            },
            '4.6': {
                id: '4.6',
                title: 'Approximating Values Using Local Linearity',
                content: '<h3>Local Linear Approximation</h3><p>Near any point, a smooth curve looks like its tangent line. We use this for approximation.</p><div class="definition"><strong>Linear Approximation:</strong> $$f(x) \\approx f(a) + f\'(a)(x - a)$$ for $x$ near $a$.</div><div class="definition"><strong>Differential:</strong> $$dy = f\'(x) \\cdot dx$$ approximates $\\Delta y$</div><div class="example"><div class="example-header">Example</div><p>Approximate $\\sqrt{4.1}$ using $f(x) = \\sqrt{x}$ at $a = 4$:</p><p>$f(4) = 2$, $f\'(4) = \\frac{1}{4}$</p><p>$\\sqrt{4.1} \\approx 2 + \\frac{1}{4}(0.1) = 2.025$</p><p>(Actual: 2.0248...)</p></div>'
            },
            '4.7': {
                id: '4.7',
                title: 'Using L\'Hospital\'s Rule',
                content: '<h3>L\'Hospital\'s Rule</h3><p>When limits yield indeterminate forms, L\'Hospital\'s Rule provides a way forward.</p><div class="definition"><strong>L\'Hospital\'s Rule:</strong> If $\\lim_{x \\to c} \\frac{f(x)}{g(x)}$ gives $\\frac{0}{0}$ or $\\frac{\\pm\\infty}{\\pm\\infty}$, then: $$\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f\'(x)}{g\'(x)}$$ (if right side exists)</div><div class="example"><div class="example-header">Example</div><p>$\\lim_{x \\to 0} \\frac{\\sin x}{x}$ gives $\\frac{0}{0}$</p><p>L\'Hospital: $\\lim_{x \\to 0} \\frac{\\cos x}{1} = 1$</p></div><div class="example"><div class="example-header">Example</div><p>$\\lim_{x \\to \\infty} \\frac{e^x}{x^2}$ gives $\\frac{\\infty}{\\infty}$</p><p>Apply twice: $\\frac{e^x}{2x} \\to \\frac{e^x}{2} \\to \\infty$</p></div><div class="key-concept"><strong>Caution:</strong> Only use for $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$!</div>'
            },
            // ========== UNIT 5: ANALYTICAL APPLICATIONS ==========
            '5.1': {
                id: '5.1',
                title: 'Using the Mean Value Theorem',
                content: '<h3>Mean Value Theorem</h3><p>In the Mining Caverns, the miners knew: between any two depths, there must be a point where the slope of the tunnel equals the average slope between entry points.</p><div class="definition"><strong>Mean Value Theorem:</strong> If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, then there exists $c$ in $(a,b)$ such that: $$f\'(c) = \\frac{f(b) - f(a)}{b - a}$$</div><div class="key-concept">The instantaneous rate somewhere equals the average rate over the interval.</div><div class="example"><div class="example-header">Example</div><p>For $f(x) = x^2$ on $[1, 3]$:</p><p>Average rate: $\\frac{9-1}{3-1} = 4$</p><p>$f\'(c) = 2c = 4 \\Rightarrow c = 2$</p></div>'
            },
            '5.2': {
                id: '5.2',
                title: 'Extreme Value Theorem and Critical Points',
                content: '<h3>Finding Extrema</h3><div class="definition"><strong>Extreme Value Theorem:</strong> If $f$ is continuous on $[a,b]$, then $f$ attains both an absolute maximum and minimum on $[a,b]$.</div><div class="definition"><strong>Critical Point:</strong> $x = c$ is critical if $f\'(c) = 0$ or $f\'(c)$ is undefined.</div><div class="key-concept"><strong>Finding Absolute Extrema on $[a,b]$:</strong><ol><li>Find all critical points in $(a,b)$</li><li>Evaluate $f$ at critical points and endpoints</li><li>Largest value = absolute max; smallest = absolute min</li></ol></div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^3 - 3x$ on $[-2, 2]$</p><p>$f\'(x) = 3x^2 - 3 = 0 \\Rightarrow x = \\pm 1$</p><p>Compare $f(-2), f(-1), f(1), f(2)$</p></div>'
            },
            '5.3': {
                id: '5.3',
                title: 'Determining Intervals of Increasing/Decreasing',
                content: '<h3>Increasing and Decreasing</h3><div class="definition"><ul><li>$f\'(x) > 0$: $f$ is <strong>increasing</strong></li><li>$f\'(x) < 0$: $f$ is <strong>decreasing</strong></li></ul></div><div class="key-concept"><strong>Process:</strong><ol><li>Find where $f\'(x) = 0$ or undefined</li><li>Create sign chart for $f\'$</li><li>Determine intervals of increase/decrease</li></ol></div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^3 - 12x$</p><p>$f\'(x) = 3x^2 - 12 = 3(x-2)(x+2)$</p><p>$f\' > 0$ on $(-\\infty, -2) \\cup (2, \\infty)$: increasing</p><p>$f\' < 0$ on $(-2, 2)$: decreasing</p></div>'
            },
            '5.4': {
                id: '5.4',
                title: 'Using the First Derivative Test',
                content: '<h3>First Derivative Test</h3><div class="definition"><strong>First Derivative Test:</strong> At critical point $c$:<ul><li>$f\'$ changes $+$ to $-$: local maximum</li><li>$f\'$ changes $-$ to $+$: local minimum</li><li>$f\'$ doesn\'t change sign: no extremum</li></ul></div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^3 - 3x$, $f\'(x) = 3(x-1)(x+1)$</p><p>At $x = -1$: $f\'$ goes from $+$ to $-$ → local max</p><p>At $x = 1$: $f\'$ goes from $-$ to $+$ → local min</p></div>'
            },
            '5.5': {
                id: '5.5',
                title: 'Using the Candidates Test',
                content: '<h3>Candidates Test for Absolute Extrema</h3><div class="definition"><strong>On Closed Interval $[a,b]$:</strong><ol><li>Find all critical points in $(a,b)$</li><li>Create list of "candidates": critical points + endpoints</li><li>Evaluate $f$ at each candidate</li><li>Largest = absolute max, smallest = absolute min</li></ol></div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^4 - 2x^2$ on $[-2, 2]$</p><p>$f\'(x) = 4x^3 - 4x = 4x(x-1)(x+1) = 0$</p><p>Critical: $x = -1, 0, 1$</p><p>Candidates: $-2, -1, 0, 1, 2$</p><p>Evaluate and compare.</p></div>'
            },
            '5.6': {
                id: '5.6',
                title: 'Determining Concavity',
                content: '<h3>Concavity</h3><div class="definition"><ul><li>$f\'\'(x) > 0$: concave up (holds water)</li><li>$f\'\'(x) < 0$: concave down (spills water)</li></ul></div><div class="definition"><strong>Inflection Point:</strong> Where concavity changes (usually where $f\'\' = 0$ or undefined)</div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^3$</p><p>$f\'\'(x) = 6x$</p><p>$f\'\' > 0$ for $x > 0$: concave up</p><p>$f\'\' < 0$ for $x < 0$: concave down</p><p>Inflection at $x = 0$</p></div>'
            },
            '5.7': {
                id: '5.7',
                title: 'Using the Second Derivative Test',
                content: '<h3>Second Derivative Test</h3><div class="definition"><strong>At critical point $c$ where $f\'(c) = 0$:</strong><ul><li>$f\'\'(c) > 0$: local minimum</li><li>$f\'\'(c) < 0$: local maximum</li><li>$f\'\'(c) = 0$: test inconclusive</li></ul></div><div class="key-concept">Concave up at critical point = minimum (bowl shape)<br>Concave down at critical point = maximum (hill shape)</div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^4 - 4x^2$</p><p>$f\'(x) = 4x^3 - 8x = 0$ at $x = 0, \\pm\\sqrt{2}$</p><p>$f\'\'(x) = 12x^2 - 8$</p><p>$f\'\'(0) = -8 < 0$: local max at $x = 0$</p></div>'
            },
            '5.8': {
                id: '5.8',
                title: 'Sketching Graphs',
                content: '<h3>Curve Sketching Guide</h3><div class="definition"><strong>Complete Analysis:</strong><ol><li>Domain and intercepts</li><li>Symmetry (even/odd)</li><li>Asymptotes (vertical, horizontal)</li><li>$f\'$: increasing/decreasing, local extrema</li><li>$f\'\'$: concavity, inflection points</li></ol></div><div class="key-concept"><strong>Key Features:</strong><ul><li>Critical points: where $f\' = 0$ or undefined</li><li>Inflection points: where $f\'\'$ changes sign</li><li>Combine all information to sketch</li></ul></div>'
            },
            '5.9': {
                id: '5.9',
                title: 'Connecting f, f\', and f\'\'',
                content: '<h3>Reading Graphs of Derivatives</h3><div class="definition"><strong>From $f$ to $f\'$:</strong><ul><li>$f$ increasing → $f\' > 0$</li><li>$f$ has local max/min → $f\' = 0$</li><li>$f$ steeper → $|f\'|$ larger</li></ul></div><div class="definition"><strong>From $f\'$ to $f\'\'$:</strong><ul><li>$f\'$ increasing → $f\'\' > 0$ (concave up)</li><li>$f\'$ decreasing → $f\'\' < 0$ (concave down)</li></ul></div><div class="key-concept">At inflection point: $f\'$ has local extremum</div>'
            },
            '5.10': {
                id: '5.10',
                title: 'Introduction to Optimization',
                content: '<h3>Optimization Problems</h3><p>The miners sought optimal paths—maximum ore, minimum effort. Calculus provides the tools.</p><div class="definition"><strong>Process:</strong><ol><li>Identify quantity to optimize</li><li>Express as function of one variable</li><li>Find critical points</li><li>Verify maximum or minimum</li><li>Answer the question asked</li></ol></div><div class="example"><div class="example-header">Example Setup</div><p>Maximize area of rectangle with perimeter 100:</p><p>$P = 2l + 2w = 100 \\Rightarrow w = 50 - l$</p><p>$A = lw = l(50-l) = 50l - l^2$</p><p>Find $l$ that maximizes $A$.</p></div>'
            },
            '5.11': {
                id: '5.11',
                title: 'Solving Optimization Problems',
                content: '<h3>Worked Optimization Examples</h3><div class="example"><div class="example-header">Rectangle of Maximum Area</div><p>Perimeter = 100</p><p>$A(l) = 50l - l^2$</p><p>$A\'(l) = 50 - 2l = 0 \\Rightarrow l = 25$</p><p>$w = 50 - 25 = 25$ (square)</p><p>Maximum area = 625</p></div><div class="example"><div class="example-header">Minimum Distance</div><p>Point on $y = x^2$ closest to $(0, 1)$:</p><p>$D^2 = x^2 + (x^2-1)^2$</p><p>Minimize $D^2$ (avoids square root)</p></div><div class="key-concept">Check endpoints and verify with second derivative test.</div>'
            },
            '5.12': {
                id: '5.12',
                title: 'Exploring Behaviors of Implicit Relations',
                content: '<h3>Implicit Relations</h3><p>Some curves cannot be written as $y = f(x)$, but we can still analyze them.</p><div class="example"><div class="example-header">Circle $x^2 + y^2 = 25$</div><p>$\\frac{dy}{dx} = -\\frac{x}{y}$</p><p>At $(3, 4)$: slope $= -\\frac{3}{4}$</p><p>At $(0, 5)$: slope $= 0$ (horizontal tangent)</p><p>At $(5, 0)$: slope undefined (vertical tangent)</p></div><div class="key-concept">Implicit curves can have multiple $y$-values for one $x$, vertical tangents, and self-intersections.</div>'
            },
            // ========== UNIT 6: INTEGRATION ==========
            '6.1': {
                id: '6.1',
                title: 'Exploring Accumulations of Change',
                content: '<h3>Accumulation Functions</h3><p>The Reservoir collects water over time. How much water accumulates depends on the rate of flow.</p><div class="definition"><strong>Accumulation:</strong> If $r(t)$ is a rate of change, then the total change from $a$ to $b$ is: $$\\text{Total Change} = \\int_a^b r(t)\\, dt$$</div><div class="example"><div class="example-header">Example</div><p>Water flows at $r(t) = 3t$ gallons/minute. Total water in first 4 minutes:</p><p>$\\int_0^4 3t\\, dt = \\frac{3t^2}{2}\\Big|_0^4 = 24$ gallons</p></div><div class="key-concept">Integration "undoes" differentiation—it accumulates rates into totals.</div>'
            },
            '6.2': {
                id: '6.2',
                title: 'Approximating Areas with Riemann Sums',
                content: '<h3>Riemann Sums</h3><div class="definition"><strong>Approximating Area:</strong> Divide $[a,b]$ into $n$ rectangles of width $\\Delta x = \\frac{b-a}{n}$. $$\\text{Area} \\approx \\sum_{i=1}^n f(x_i^*) \\Delta x$$</div><div class="key-concept"><strong>Types:</strong><ul><li>Left Riemann: use left endpoint</li><li>Right Riemann: use right endpoint</li><li>Midpoint: use midpoint of each subinterval</li></ul></div><div class="example"><div class="example-header">Example</div><p>$f(x) = x^2$ on $[0, 2]$ with $n = 4$:</p><p>Left sum: $0^2 + 0.5^2 + 1^2 + 1.5^2 \\cdot 0.5 = 1.75$</p></div>'
            },
            '6.3': {
                id: '6.3',
                title: 'Riemann Sums, Summation Notation, Definite Integrals',
                content: '<h3>From Sums to Integrals</h3><div class="definition"><strong>Definite Integral:</strong> $$\\int_a^b f(x)\\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i^*) \\Delta x$$</div><div class="key-concept"><strong>Notation:</strong><ul><li>$\\int$ — integral sign</li><li>$a, b$ — bounds (limits)</li><li>$f(x)$ — integrand</li><li>$dx$ — variable of integration</li></ul></div><div class="definition">The definite integral gives <strong>signed area</strong>: positive above x-axis, negative below.</div>'
            },
            '6.4': {
                id: '6.4',
                title: 'The Fundamental Theorem of Calculus',
                content: '<h3>FTC Part 1</h3><div class="definition"><strong>FTC Part 1:</strong> If $F(x) = \\int_a^x f(t)\\, dt$, then: $$F\'(x) = f(x)$$</div><p>The derivative of the accumulation function is the original function!</p><div class="example"><div class="example-header">Example</div><p>If $F(x) = \\int_0^x \\sin(t^2)\\, dt$</p><p>Then $F\'(x) = \\sin(x^2)$</p></div><div class="key-concept">With chain rule: $\\frac{d}{dx}\\int_a^{g(x)} f(t)\\, dt = f(g(x)) \\cdot g\'(x)$</div>'
            },
            '6.5': {
                id: '6.5',
                title: 'Properties of Definite Integrals',
                content: '<h3>Integration Properties</h3><div class="definition"><strong>Key Properties:</strong><ul><li>$\\int_a^a f(x)\\, dx = 0$</li><li>$\\int_a^b f(x)\\, dx = -\\int_b^a f(x)\\, dx$</li><li>$\\int_a^b [f(x) + g(x)]\\, dx = \\int_a^b f\\, dx + \\int_a^b g\\, dx$</li><li>$\\int_a^b cf(x)\\, dx = c\\int_a^b f(x)\\, dx$</li><li>$\\int_a^c f\\, dx + \\int_c^b f\\, dx = \\int_a^b f\\, dx$</li></ul></div>'
            },
            '6.6': {
                id: '6.6',
                title: 'Applying Properties of Definite Integrals',
                content: '<h3>Working with Integrals</h3><div class="example"><div class="example-header">Example</div><p>If $\\int_0^5 f(x)\\, dx = 7$ and $\\int_5^8 f(x)\\, dx = 4$:</p><p>Then $\\int_0^8 f(x)\\, dx = 7 + 4 = 11$</p></div><div class="example"><div class="example-header">Even/Odd Functions</div><p>If $f$ is even: $\\int_{-a}^a f(x)\\, dx = 2\\int_0^a f(x)\\, dx$</p><p>If $f$ is odd: $\\int_{-a}^a f(x)\\, dx = 0$</p></div>'
            },
            '6.7': {
                id: '6.7',
                title: 'The Fundamental Theorem of Calculus Part 2',
                content: '<h3>FTC Part 2 (Evaluation Theorem)</h3><div class="definition"><strong>FTC Part 2:</strong> If $F\'(x) = f(x)$, then: $$\\int_a^b f(x)\\, dx = F(b) - F(a)$$</div><div class="example"><div class="example-header">Example</div><p>$\\int_1^4 2x\\, dx$</p><p>Antiderivative: $F(x) = x^2$</p><p>$= 4^2 - 1^2 = 15$</p></div><div class="key-concept">Write $F(x)\\Big|_a^b$ to denote $F(b) - F(a)$.</div>'
            },
            '6.8': {
                id: '6.8',
                title: 'Finding Antiderivatives',
                content: '<h3>Basic Antiderivatives</h3><div class="definition"><strong>Power Rule:</strong> $\\int x^n\\, dx = \\frac{x^{n+1}}{n+1} + C$ (for $n \\neq -1$)</div><div class="definition"><strong>Key Antiderivatives:</strong><ul><li>$\\int e^x\\, dx = e^x + C$</li><li>$\\int \\frac{1}{x}\\, dx = \\ln|x| + C$</li><li>$\\int \\cos x\\, dx = \\sin x + C$</li><li>$\\int \\sin x\\, dx = -\\cos x + C$</li><li>$\\int \\sec^2 x\\, dx = \\tan x + C$</li></ul></div><div class="key-concept">$+C$ represents any constant (indefinite integrals).</div>'
            },
            '6.9': {
                id: '6.9',
                title: 'Integrating Using Substitution',
                content: '<h3>u-Substitution</h3><p>The reverse of chain rule for integration.</p><div class="definition"><strong>Method:</strong><ol><li>Choose $u = g(x)$ (inner function)</li><li>Find $du = g\'(x)\\, dx$</li><li>Rewrite integral in terms of $u$</li><li>Integrate and substitute back</li></ol></div><div class="example"><div class="example-header">Example</div><p>$\\int 2x e^{x^2}\\, dx$</p><p>Let $u = x^2$, $du = 2x\\, dx$</p><p>$= \\int e^u\\, du = e^u + C = e^{x^2} + C$</p></div>'
            },
            '6.10': {
                id: '6.10',
                title: 'Integrating Functions Using Long Division',
                content: '<h3>Long Division for Integration</h3><p>When the numerator degree $\\geq$ denominator degree, divide first.</p><div class="example"><div class="example-header">Example</div><p>$\\int \\frac{x^2 + 1}{x}\\, dx = \\int (x + \\frac{1}{x})\\, dx$</p><p>$= \\frac{x^2}{2} + \\ln|x| + C$</p></div><div class="key-concept">Simplify before integrating when possible.</div>'
            },
            '6.14': {
                id: '6.14',
                title: 'Selecting Techniques for Antidifferentiation',
                content: '<h3>Choosing Integration Methods</h3><div class="definition"><strong>Decision Guide:</strong><ul><li><strong>Basic form:</strong> Use power, trig, or exponential rules</li><li><strong>Composite function:</strong> Try u-substitution</li><li><strong>Rational with degree num ≥ denom:</strong> Long division first</li><li><strong>$\\frac{1}{x}$:</strong> Gives $\\ln|x|$</li></ul></div><div class="key-concept">Look for patterns: What would differentiate to give this?</div>'
            },
            // ========== UNIT 7: DIFFERENTIAL EQUATIONS ==========
            '7.1': {
                id: '7.1',
                title: 'Modeling Situations with Differential Equations',
                content: '<h3>Differential Equations</h3><p>In the Alchemist\'s Lab, potions change over time. The rate of change depends on the current amount—this relationship is a differential equation.</p><div class="definition"><strong>Differential Equation:</strong> An equation involving a function and its derivatives. Example: $\\frac{dy}{dt} = ky$ (rate proportional to amount)</div><div class="example"><div class="example-header">Example</div><p>Radioactive decay: $\\frac{dN}{dt} = -0.1N$</p><p>Population growth: $\\frac{dP}{dt} = 0.05P$</p></div><div class="key-concept">The equation describes HOW the quantity changes, not what it equals.</div>'
            },
            '7.2': {
                id: '7.2',
                title: 'Verifying Solutions for Differential Equations',
                content: '<h3>Verifying Solutions</h3><div class="definition"><strong>To verify $y = f(x)$ solves a DE:</strong><ol><li>Find $y\'$ (and $y\'\'$ if needed)</li><li>Substitute into the DE</li><li>Verify both sides are equal</li></ol></div><div class="example"><div class="example-header">Example</div><p>Verify $y = e^{2x}$ solves $y\' = 2y$:</p><p>$y\' = 2e^{2x}$ and $2y = 2e^{2x}$ ✓</p></div><div class="key-concept">A solution that works for any value of $C$ is a <strong>general solution</strong>.</div>'
            },
            '7.3': {
                id: '7.3',
                title: 'Sketching Slope Fields',
                content: '<h3>Slope Fields</h3><p>A slope field visualizes a differential equation by showing the slope at each point.</p><div class="definition"><strong>Slope Field:</strong> At each point $(x, y)$, draw a short segment with slope $= f(x, y)$ where $\\frac{dy}{dx} = f(x, y)$.</div><div class="example"><div class="example-header">Example</div><p>For $\\frac{dy}{dx} = x$:</p><p>At $(1, 0)$: slope = 1</p><p>At $(2, 3)$: slope = 2</p><p>At $(-1, 5)$: slope = -1</p></div><div class="key-concept">Solution curves follow the direction of the slope field.</div>'
            },
            '7.4': {
                id: '7.4',
                title: 'Reasoning Using Slope Fields',
                content: '<h3>Interpreting Slope Fields</h3><div class="definition"><strong>Key Observations:</strong><ul><li>Where is slope = 0? (horizontal segments)</li><li>Where is slope positive/negative?</li><li>Where is slope steep?</li></ul></div><div class="example"><div class="example-header">Example</div><p>For $\\frac{dy}{dx} = y$:</p><p>Slope = 0 when $y = 0$ (x-axis)</p><p>Above x-axis: positive slope (curves rise)</p><p>Below x-axis: negative slope (curves fall)</p></div><div class="key-concept">Sketch solution curves by following the arrows.</div>'
            },
            '7.6': {
                id: '7.6',
                title: 'Finding General Solutions Using Separation of Variables',
                content: '<h3>Separation of Variables</h3><div class="definition"><strong>Method:</strong> If $\\frac{dy}{dx} = f(x)g(y)$:<ol><li>Rewrite as $\\frac{dy}{g(y)} = f(x)\\, dx$</li><li>Integrate both sides</li><li>Solve for $y$ if possible</li></ol></div><div class="example"><div class="example-header">Example</div><p>Solve $\\frac{dy}{dx} = xy$:</p><p>$\\frac{dy}{y} = x\\, dx$</p><p>$\\ln|y| = \\frac{x^2}{2} + C$</p><p>$y = Ae^{x^2/2}$</p></div>'
            },
            '7.7': {
                id: '7.7',
                title: 'Finding Particular Solutions Using Initial Conditions',
                content: '<h3>Initial Value Problems</h3><div class="definition"><strong>Particular Solution:</strong> Use initial condition to find the specific value of $C$.</div><div class="example"><div class="example-header">Example</div><p>Solve $\\frac{dy}{dx} = 2y$, $y(0) = 3$:</p><p>General: $y = Ce^{2x}$</p><p>$y(0) = 3$: $Ce^0 = 3$, so $C = 3$</p><p>Particular: $y = 3e^{2x}$</p></div><div class="key-concept">Initial condition picks one curve from the family of solutions.</div>'
            },
            '7.8': {
                id: '7.8',
                title: 'Exponential Models with Differential Equations',
                content: '<h3>Exponential Models</h3><div class="definition"><strong>Exponential Growth/Decay:</strong> $\\frac{dy}{dt} = ky$ has solution $y = y_0 e^{kt}$<ul><li>$k > 0$: exponential growth</li><li>$k < 0$: exponential decay</li></ul></div><div class="example"><div class="example-header">Example: Half-Life</div><p>If $y = y_0 e^{-0.1t}$, half-life is when $y = \\frac{y_0}{2}$:</p><p>$\\frac{1}{2} = e^{-0.1t}$</p><p>$t = \\frac{\\ln 2}{0.1} \\approx 6.93$</p></div><div class="key-concept">$\\frac{dy}{dt} = ky$ models: population, radioactive decay, compound interest, cooling.</div>'
            },
            // ========== UNIT 8: APPLICATIONS OF INTEGRATION ==========
            '8.1': {
                id: '8.1',
                title: 'Finding the Average Value of a Function',
                content: '<h3>Average Value</h3><p>The Architects calculated average heights and widths—the integral provides the mean value of a function.</p><div class="definition"><strong>Average Value:</strong> $$f_{avg} = \\frac{1}{b-a}\\int_a^b f(x)\\, dx$$</div><div class="example"><div class="example-header">Example</div><p>Average of $f(x) = x^2$ on $[0, 3]$:</p><p>$f_{avg} = \\frac{1}{3}\\int_0^3 x^2\\, dx = \\frac{1}{3} \\cdot 9 = 3$</p></div><div class="key-concept">Average value balances the function—area under constant $f_{avg}$ equals area under $f$.</div>'
            },
            '8.2': {
                id: '8.2',
                title: 'Position, Velocity, and Acceleration with Integrals',
                content: '<h3>Motion and Integrals</h3><div class="definition"><strong>Relationships:</strong><ul><li>$v(t) = \\int a(t)\\, dt$</li><li>$s(t) = \\int v(t)\\, dt$</li><li>Displacement: $\\int_a^b v(t)\\, dt$</li><li>Distance: $\\int_a^b |v(t)|\\, dt$</li></ul></div><div class="example"><div class="example-header">Example</div><p>If $v(t) = t - 2$ on $[0, 4]$:</p><p>Displacement: $\\int_0^4 (t-2)\\, dt = 0$</p><p>Distance: $\\int_0^2 |t-2|\\, dt + \\int_2^4 |t-2|\\, dt = 4$</p></div>'
            },
            '8.3': {
                id: '8.3',
                title: 'Accumulation Functions in Context',
                content: '<h3>Accumulation in Applications</h3><div class="definition">If $R(t)$ is rate of change, total change from $a$ to $b$: $$\\int_a^b R(t)\\, dt = F(b) - F(a)$$</div><div class="example"><div class="example-header">Example</div><p>Water flows at $r(t) = 2 + \\sin t$ gal/min. Total water from $t = 0$ to $t = \\pi$:</p><p>$\\int_0^{\\pi} (2 + \\sin t)\\, dt = 2\\pi + 2$ gallons</p></div><div class="key-concept">Net change = integral of rate over time.</div>'
            },
            '8.4': {
                id: '8.4',
                title: 'Area Between Curves (Vertical Slices)',
                content: '<h3>Area Between Curves</h3><div class="definition"><strong>Vertical Slices:</strong> If $f(x) \\geq g(x)$ on $[a,b]$: $$\\text{Area} = \\int_a^b [f(x) - g(x)]\\, dx$$</div><div class="example"><div class="example-header">Example</div><p>Area between $y = x^2$ and $y = x$ from $x = 0$ to $x = 1$:</p><p>$\\int_0^1 (x - x^2)\\, dx = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}$</p></div><div class="key-concept">Top minus bottom, integrate over $x$.</div>'
            },
            '8.5': {
                id: '8.5',
                title: 'Area Between Curves (Horizontal Slices)',
                content: '<h3>Horizontal Slices</h3><div class="definition"><strong>Integrate with respect to $y$:</strong> If $f(y) \\geq g(y)$: $$\\text{Area} = \\int_c^d [f(y) - g(y)]\\, dy$$</div><div class="example"><div class="example-header">Example</div><p>Area between $x = y^2$ and $x = y + 2$:</p><p>Find intersection: $y^2 = y + 2 \\Rightarrow y = -1, 2$</p><p>$\\int_{-1}^2 [(y+2) - y^2]\\, dy = \\frac{9}{2}$</p></div><div class="key-concept">Right minus left, integrate over $y$.</div>'
            },
            '8.6': {
                id: '8.6',
                title: 'Area Between Multiple Curves',
                content: '<h3>Multiple Intersections</h3><div class="definition">When curves cross, split into regions where one is consistently above the other.</div><div class="example"><div class="example-header">Example</div><p>Area between $y = x^2$ and $y = 2 - x^2$:</p><p>Intersect: $x^2 = 2 - x^2 \\Rightarrow x = \\pm 1$</p><p>$\\int_{-1}^1 [(2-x^2) - x^2]\\, dx = \\int_{-1}^1 (2 - 2x^2)\\, dx = \\frac{8}{3}$</p></div>'
            },
            '8.7': {
                id: '8.7',
                title: 'Volumes with Cross Sections: Squares and Rectangles',
                content: '<h3>Volumes by Cross Sections</h3><p>The Architects calculated the volume of stone needed for their structures.</p><div class="definition"><strong>General Formula:</strong> $$V = \\int_a^b A(x)\\, dx$$ where $A(x)$ is cross-sectional area.</div><div class="example"><div class="example-header">Square Cross Sections</div><p>Base: region under $y = x$ from $x = 0$ to $x = 2$. Cross sections are squares with side $= y = x$.</p><p>$V = \\int_0^2 x^2\\, dx = \\frac{8}{3}$</p></div>'
            },
            '8.8': {
                id: '8.8',
                title: 'Volumes with Cross Sections: Triangles and Semicircles',
                content: '<h3>Other Cross-Section Shapes</h3><div class="definition"><strong>Area Formulas:</strong><ul><li>Equilateral triangle: $A = \\frac{\\sqrt{3}}{4}s^2$</li><li>Isosceles right triangle: $A = \\frac{1}{2}s^2$</li><li>Semicircle: $A = \\frac{\\pi}{8}d^2$ (diameter $d$)</li></ul></div><div class="example"><div class="example-header">Semicircle Cross Sections</div><p>Base between $y = 0$ and $y = 1 - x^2$. Semicircles with diameter $= 1 - x^2$:</p><p>$A = \\frac{\\pi}{8}(1-x^2)^2$</p><p>$V = \\int_{-1}^1 \\frac{\\pi}{8}(1-x^2)^2\\, dx$</p></div>'
            },
            '8.9': {
                id: '8.9',
                title: 'Disc Method: Revolving Around x or y Axis',
                content: '<h3>Disc Method</h3><div class="definition"><strong>Around x-axis:</strong> $$V = \\pi\\int_a^b [f(x)]^2\\, dx$$</div><div class="definition"><strong>Around y-axis:</strong> $$V = \\pi\\int_c^d [g(y)]^2\\, dy$$</div><div class="example"><div class="example-header">Example</div><p>$y = x^2$ from $x = 0$ to $x = 2$ rotated around x-axis:</p><p>$V = \\pi\\int_0^2 (x^2)^2\\, dx = \\pi\\int_0^2 x^4\\, dx = \\frac{32\\pi}{5}$</p></div>'
            },
            '8.10': {
                id: '8.10',
                title: 'Disc Method: Revolving Around Other Axes',
                content: '<h3>Rotation Around Other Lines</h3><div class="definition">When rotating around $y = k$ or $x = k$, adjust the radius.</div><div class="example"><div class="example-header">Around $y = -1$</div><p>$y = x^2$ rotated around $y = -1$:</p><p>Radius $= x^2 - (-1) = x^2 + 1$</p><p>$V = \\pi\\int_a^b (x^2 + 1)^2\\, dx$</p></div><div class="key-concept">Radius = distance from curve to axis of rotation.</div>'
            },
            '8.11': {
                id: '8.11',
                title: 'Washer Method: Revolving Around x or y Axis',
                content: '<h3>Washer Method</h3><p>When there\'s a hole in the middle (region between two curves).</p><div class="definition"><strong>Formula:</strong> $$V = \\pi\\int_a^b \\left([R(x)]^2 - [r(x)]^2\\right)\\, dx$$ where $R$ = outer radius, $r$ = inner radius.</div><div class="example"><div class="example-header">Example</div><p>Between $y = x$ and $y = x^2$ from 0 to 1, around x-axis:</p><p>$V = \\pi\\int_0^1 (x^2 - x^4)\\, dx = \\frac{2\\pi}{15}$</p></div>'
            },
            '8.12': {
                id: '8.12',
                title: 'Washer Method: Revolving Around Other Axes',
                content: '<h3>Washers Around Other Lines</h3><div class="definition">Adjust both $R$ and $r$ for the new axis of rotation.</div><div class="example"><div class="example-header">Around $y = 2$</div><p>Between $y = x$ and $y = x^2$ (0 to 1), around $y = 2$:</p><p>$R = 2 - x^2$, $r = 2 - x$</p><p>$V = \\pi\\int_0^1 [(2-x^2)^2 - (2-x)^2]\\, dx$</p></div><div class="key-concept">Outer radius from axis to farther curve; inner radius to closer curve.</div>'
            }
        };

        const placeholderContent = '<h3>Coming Soon</h3><p>This lesson is being transcribed from the ancient texts of Infinitia.</p>';

        function getLesson(topicId) {
            if (lessons[topicId]) {
                return lessons[topicId];
            }
            return {
                id: topicId,
                title: 'Topic ' + topicId,
                content: placeholderContent
            };
        }

        return {
            lessons: lessons,
            getLesson: getLesson
        };
    })();

    // ============================================
    // PUZZLES MODULE
    // ============================================
    const Puzzles = (function() {
        const puzzles = [
            // Topic 1.1
            { topic: '1.1', type: 'multiple_choice', stem: 'Which best describes the central question of calculus?', choices: ['How do we measure exact function values?', 'How do we measure instantaneous rates of change?', 'How do we find maximum values?', 'How do we calculate areas?'], correct: 1, explanation: 'Calculus answers: how can we measure instantaneous rates of change?' },
            { topic: '1.1', type: 'multiple_choice', stem: 'The average rate of change of $f$ over $[a, b]$ is:', choices: ['$f(b) - f(a)$', '$\\frac{f(b) - f(a)}{b - a}$', '$\\frac{b - a}{f(b) - f(a)}$', '$f(b) + f(a)$'], correct: 1, explanation: 'Average rate of change = $\\frac{\\Delta y}{\\Delta x} = \\frac{f(b) - f(a)}{b - a}$' },
            { topic: '1.1', type: 'multiple_choice', stem: 'If $h(2) = 3.5$ and $h(5) = 5.0$, the average rate of change is:', choices: ['$0.5$ per unit', '$1.5$ per unit', '$2.5$ per unit', '$4.25$ per unit'], correct: 0, explanation: '$\\frac{5.0 - 3.5}{5 - 2} = \\frac{1.5}{3} = 0.5$' },
            { topic: '1.1', type: 'multiple_choice', stem: 'To find instantaneous rate of change at $t = 3$, we:', choices: ['Calculate $f(3)$ directly', 'Find average rate over shrinking intervals containing $t = 3$', 'Find maximum near $t = 3$', 'Calculate $f(3) - f(0)$'], correct: 1, explanation: 'Instantaneous rate = limit of average rate as interval shrinks to zero.' },
            { topic: '1.1', type: 'multiple_choice', stem: 'For $s(t) = t^2$, average velocity from $t = 1$ to $t = 3$ is:', choices: ['$2$ m/s', '$4$ m/s', '$5$ m/s', '$8$ m/s'], correct: 1, explanation: '$\\frac{s(3) - s(1)}{3 - 1} = \\frac{9 - 1}{2} = 4$ m/s' },
            { topic: '1.1', type: 'multiple_choice', stem: 'The average rate of change of $f(x) = x^2$ from $x = 2$ to $x = 2 + h$ is:', choices: ['$4 + h$', '$4 + 2h$', '$h + h^2$', '$2h + h^2$'], correct: 0, explanation: '$\\frac{(2+h)^2 - 4}{h} = \\frac{4h + h^2}{h} = 4 + h$' },
            { topic: '1.1', type: 'multiple_choice', stem: 'A speedometer measures:', choices: ['Average speed', 'Total distance', 'Instantaneous speed', 'Acceleration'], correct: 2, explanation: 'A speedometer shows instantaneous speed—how fast right now.' },
            { topic: '1.1', type: 'multiple_choice', stem: 'For $f(x) = 3x - 1$, the average rate over any interval is:', choices: ['$3$', '$-1$', '$3x$', 'Depends on interval'], correct: 0, explanation: 'For linear $f(x) = mx + b$, average rate always equals slope $m = 3$.' },

            // Topic 1.2
            { topic: '1.2', type: 'multiple_choice', stem: '$\\lim_{x \\to 3} f(x) = 7$ means:', choices: ['$f(3) = 7$', 'As $x$ approaches $3$, $f(x)$ approaches $7$', '$f(x) = 7$ when $x > 3$', 'Function equals $7$ near $3$'], correct: 1, explanation: 'Limit notation describes what value the function approaches.' },
            { topic: '1.2', type: 'multiple_choice', stem: '$\\lim_{x \\to 2^-} f(x)$ represents:', choices: ['Limit from values greater than $2$', 'Limit from values less than $2$', 'Limit as $x \\to -2$', 'Negative of limit at $2$'], correct: 1, explanation: 'The superscript "$-$" means approaching from the left (values less than 2).' },
            { topic: '1.2', type: 'multiple_choice', stem: 'For $\\lim_{x \\to c} f(x) = L$ to exist:', choices: ['$f(c) = L$', '$f(c)$ must be defined', 'Both one-sided limits equal $L$', 'All of the above'], correct: 2, explanation: 'Two-sided limit exists iff both one-sided limits exist and are equal.' },
            { topic: '1.2', type: 'multiple_choice', stem: 'If $\\lim_{x \\to 4^-} g(x) = 5$ and $\\lim_{x \\to 4^+} g(x) = 5$, then $\\lim_{x \\to 4} g(x) =$', choices: ['DNE', '$4$', '$5$', 'Cannot determine'], correct: 2, explanation: 'Both one-sided limits equal 5, so the two-sided limit is 5.' },
            { topic: '1.2', type: 'multiple_choice', stem: 'If $\\lim_{x \\to 1^-} f(x) = 3$ and $\\lim_{x \\to 1^+} f(x) = 5$, then $\\lim_{x \\to 1} f(x)$:', choices: ['Equals $3$', 'Equals $4$', 'Equals $5$', 'Does not exist'], correct: 3, explanation: 'One-sided limits differ ($3 \\neq 5$), so two-sided limit DNE.' },
            { topic: '1.2', type: 'multiple_choice', stem: 'For $f(x) = \\frac{x^2 - 9}{x - 3}$, $\\lim_{x \\to 3} f(x) =$', choices: ['$0$', '$3$', '$6$', 'DNE'], correct: 2, explanation: '$\\frac{(x-3)(x+3)}{x-3} = x + 3 \\to 6$ as $x \\to 3$.' },
            { topic: '1.2', type: 'multiple_choice', stem: 'True or False: If $\\lim_{x \\to a} f(x) = L$, then $f(a) = L$.', choices: ['True', 'False', 'True only if continuous', 'True only if $L \\neq 0$'], correct: 1, explanation: 'False. The limit describes approach, not necessarily the actual value.' },
            { topic: '1.2', type: 'multiple_choice', stem: 'If $f(x) = \\begin{cases} x + 2 & x < 1 \\\\ 5 & x = 1 \\\\ 3 - x & x > 1 \\end{cases}$, $\\lim_{x \\to 1} f(x) =$', choices: ['$2$', '$3$', '$5$', 'DNE'], correct: 3, explanation: 'Left limit = 3, right limit = 2. Since $3 \\neq 2$, limit DNE.' },

            // Topic 1.3
            { topic: '1.3', type: 'multiple_choice', stem: 'When reading a limit from a graph, look at:', choices: ['The $y$-value at the point', 'The $y$-value the curve approaches', 'The highest point', 'The $x$-intercept'], correct: 1, explanation: 'Look at where the curve is heading, not where a point is plotted.' },
            { topic: '1.3', type: 'multiple_choice', stem: 'An open circle on a graph indicates:', choices: ['Function is continuous', 'Limit does not exist', 'Function not defined there', 'Function has maximum'], correct: 2, explanation: 'Open circle = function not defined (or defined elsewhere). Limit may still exist.' },
            { topic: '1.3', type: 'multiple_choice', stem: 'If a graph jumps from $y = 3$ (left) to $y = 5$ (right) at $x = 2$:', choices: ['$\\lim_{x \\to 2} f(x) = 3$', '$\\lim_{x \\to 2} f(x) = 5$', '$\\lim_{x \\to 2} f(x) = 4$', '$\\lim_{x \\to 2} f(x)$ DNE'], correct: 3, explanation: 'Jump discontinuity: left and right limits differ, so two-sided limit DNE.' },
            { topic: '1.3', type: 'multiple_choice', stem: 'A vertical asymptote indicates:', choices: ['$\\lim = 0$', '$f(a)$ is very large', 'Function approaches $\\pm\\infty$', 'Function is continuous'], correct: 2, explanation: 'Vertical asymptote means function grows without bound near that $x$.' },
            { topic: '1.3', type: 'multiple_choice', stem: 'Graph approaches $y = 4$ as $x \\to 3$ from both sides, but solid dot at $(3, 1)$. $\\lim_{x \\to 3} f(x) =$', choices: ['$1$', '$4$', '$2.5$', 'DNE'], correct: 1, explanation: 'Limit is where curve heads (4), not where point is plotted (1).' },
            { topic: '1.3', type: 'multiple_choice', stem: 'If left limit is $\\infty$ and right limit is $-\\infty$, the two-sided limit:', choices: ['$= 0$', '$= \\infty$', '$= -\\infty$', 'DNE'], correct: 3, explanation: '$\\infty \\neq -\\infty$, so two-sided limit does not exist.' },
            { topic: '1.3', type: 'multiple_choice', stem: 'Continuous curve through $(5, 2)$ means $\\lim_{x \\to 5} f(x) =$', choices: ['$5$', '$2$', '$7$', 'Cannot determine'], correct: 1, explanation: 'If continuous, curve approaches where it passes through: $y = 2$.' },
            { topic: '1.3', type: 'multiple_choice', stem: 'If $f(x)$ oscillates between $-1$ and $1$ as $x \\to 0$ without settling:', choices: ['Limit $= 0$', 'Limit $= 1$', 'Limit $= -1$', 'Limit DNE'], correct: 3, explanation: 'Oscillating without approaching single value means limit DNE.' },

            // Topic 1.4
            { topic: '1.4', type: 'multiple_choice', stem: 'To estimate $\\lim_{x \\to 3} f(x)$ from a table, use $x$ values:', choices: ['Only $> 3$', 'Only $< 3$', 'Approaching $3$ from both sides', 'Far from $3$'], correct: 2, explanation: 'For two-sided limit, need values approaching from both directions.' },
            { topic: '1.4', type: 'multiple_choice', stem: 'Table: $f(1.9)=3.9$, $f(1.99)=3.99$, $f(2.01)=4.01$, $f(2.1)=4.1$. Estimate $\\lim_{x \\to 2} f(x)$:', choices: ['$3$', '$4$', '$3.5$', 'DNE'], correct: 1, explanation: 'From both sides, values approach 4.' },
            { topic: '1.4', type: 'multiple_choice', stem: 'Table: $f(0.9)=2.1$, $f(0.99)=2.01$, $f(1.01)=4.01$, $f(1.1)=4.1$. This suggests:', choices: ['Limit $= 2$', 'Limit $= 4$', 'Limit $= 3$', 'Limit DNE'], correct: 3, explanation: 'Left side approaches 2, right side approaches 4. Different, so DNE.' },
            { topic: '1.4', type: 'multiple_choice', stem: 'Table for $\\frac{\\sin x}{x}$: values $0.998$, $0.99998$ near $x = 0$. Estimate limit:', choices: ['$0$', '$0.998$', '$1$', 'DNE'], correct: 2, explanation: 'Values approach 1. Famous limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.' },
            { topic: '1.4', type: 'multiple_choice', stem: 'If table shows $f(x) = 10, 100, 1000, 10000$ approaching $c$:', choices: ['Limit $= 10000$', 'Limit $= \\infty$', 'Limit is finite', 'Limit $= 0$'], correct: 1, explanation: 'Values growing without bound indicates limit is $\\infty$.' },
            { topic: '1.4', type: 'multiple_choice', stem: 'A limitation of tables for limits:', choices: ['Can\'t show if limit exists', 'Give estimates, not proofs', 'Only work for polynomials', 'Can\'t detect infinite limits'], correct: 1, explanation: 'Tables show patterns but can\'t prove limits definitively.' },
            { topic: '1.4', type: 'multiple_choice', stem: 'Table: $g(-0.1)=5.01$, $g(0.01)=5.0001$, but $g(0)=-3$. $\\lim_{x \\to 0} g(x) =$', choices: ['$-3$', '$5$', '$1$', 'DNE'], correct: 1, explanation: 'Limit depends on approach (→5), not the value at the point ($-3$).' },
            { topic: '1.4', type: 'multiple_choice', stem: 'To estimate $\\lim_{x \\to 5^+} f(x)$, use:', choices: ['$4.9, 4.99, 4.999$', '$5.1, 5.01, 5.001$', '$4, 5, 6$', '$0, 2.5, 5$'], correct: 1, explanation: 'Right limit ($^+$) needs values greater than 5, approaching from above.' },

            // Topic 1.5
            { topic: '1.5', type: 'multiple_choice', stem: 'If $\\lim_{x \\to c} f(x) = 4$ and $\\lim_{x \\to c} g(x) = 3$, then $\\lim_{x \\to c} [f(x) + g(x)] =$', choices: ['$1$', '$7$', '$12$', '$4/3$'], correct: 1, explanation: 'Sum Rule: $\\lim[f + g] = \\lim f + \\lim g = 4 + 3 = 7$' },
            { topic: '1.5', type: 'multiple_choice', stem: 'If $\\lim_{x \\to 2} f(x) = 5$, then $\\lim_{x \\to 2} [3f(x)] =$', choices: ['$5$', '$8$', '$15$', '$5/3$'], correct: 2, explanation: 'Constant Multiple: $\\lim[cf] = c \\cdot \\lim f = 3 \\cdot 5 = 15$' },
            { topic: '1.5', type: 'multiple_choice', stem: '$\\lim_{x \\to 3} (x^2 - 2x + 1) =$', choices: ['$3$', '$4$', '$6$', '$10$'], correct: 1, explanation: 'Direct substitution: $9 - 6 + 1 = 4$' },
            { topic: '1.5', type: 'multiple_choice', stem: 'If $\\lim_{x \\to 1} f(x) = 2$ and $\\lim_{x \\to 1} g(x) = 4$, then $\\lim_{x \\to 1} [f(x) \\cdot g(x)] =$', choices: ['$2$', '$6$', '$8$', '$16$'], correct: 2, explanation: 'Product Rule: $\\lim[f \\cdot g] = \\lim f \\cdot \\lim g = 2 \\cdot 4 = 8$' },
            { topic: '1.5', type: 'multiple_choice', stem: '$\\lim_{x \\to 4} \\frac{x + 1}{x - 2} =$', choices: ['$3/2$', '$5/2$', '$3$', 'DNE'], correct: 1, explanation: 'Denominator not zero at $x=4$: $\\frac{5}{2}$' },
            { topic: '1.5', type: 'multiple_choice', stem: 'If $\\lim_{x \\to a} f(x) = 3$, then $\\lim_{x \\to a} [f(x)]^3 =$', choices: ['$9$', '$27$', '$3$', '$6$'], correct: 1, explanation: 'Power Rule: $\\lim[f]^n = [\\lim f]^n = 3^3 = 27$' },
            { topic: '1.5', type: 'multiple_choice', stem: '$\\lim_{x \\to 5} 7 =$', choices: ['$5$', '$7$', '$12$', '$35$'], correct: 1, explanation: 'Limit of a constant is that constant: $\\lim k = k$' },
            { topic: '1.5', type: 'multiple_choice', stem: 'If $\\lim f = 6$ and $\\lim g = 0$, what about $\\lim \\frac{f}{g}$?', choices: ['$= 0$', '$= 6$', '$= \\infty$', 'Quotient rule doesn\'t apply'], correct: 3, explanation: 'Quotient Rule requires denominator limit $\\neq 0$.' },

            // Topic 1.6
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} =$', choices: ['$0$', '$2$', '$4$', 'DNE'], correct: 2, explanation: 'Factor: $\\frac{(x-2)(x+2)}{x-2} = x + 2 \\to 4$' },
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{x \\to -3} \\frac{x^2 - 9}{x + 3} =$', choices: ['$-6$', '$0$', '$6$', 'DNE'], correct: 0, explanation: '$\\frac{(x-3)(x+3)}{x+3} = x - 3 \\to -6$' },
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{x \\to 4} \\frac{\\sqrt{x} - 2}{x - 4} =$', choices: ['$0$', '$1/4$', '$1/2$', '$1$'], correct: 1, explanation: '$x - 4 = (\\sqrt{x}-2)(\\sqrt{x}+2)$, so limit $= \\frac{1}{\\sqrt{4}+2} = \\frac{1}{4}$' },
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{\\sqrt{x + 9} - 3}{x} =$', choices: ['$0$', '$1/6$', '$1/3$', 'DNE'], correct: 1, explanation: 'Rationalize to get $\\frac{1}{\\sqrt{x+9}+3} \\to \\frac{1}{6}$' },
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{x \\to 1} \\frac{x^3 - 1}{x - 1} =$', choices: ['$1$', '$2$', '$3$', 'DNE'], correct: 2, explanation: '$x^3 - 1 = (x-1)(x^2+x+1)$, so limit $= 1 + 1 + 1 = 3$' },
            { topic: '1.6', type: 'multiple_choice', stem: 'If direct substitution gives $\\frac{0}{0}$:', choices: ['Limit $= 0$', 'Limit $= 1$', 'Limit DNE', 'May exist, needs more work'], correct: 3, explanation: '$\\frac{0}{0}$ is indeterminate—limit could be anything.' },
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{h \\to 0} \\frac{(2+h)^2 - 4}{h} =$', choices: ['$0$', '$2$', '$4$', '$8$'], correct: 2, explanation: '$\\frac{4 + 4h + h^2 - 4}{h} = 4 + h \\to 4$' },
            { topic: '1.6', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{\\frac{1}{x+3} - \\frac{1}{3}}{x} =$', choices: ['$-1/9$', '$0$', '$1/9$', '$1/3$'], correct: 0, explanation: 'Combine fractions: $\\frac{-1}{3(x+3)} \\to -\\frac{1}{9}$' },

            // Topic 1.7
            { topic: '1.7', type: 'multiple_choice', stem: 'To find $\\lim_{x \\to 5} \\frac{x^2 - 25}{x - 5}$, best first step:', choices: ['Use table', 'Factor numerator', 'Rationalize', 'L\'Hôpital\'s Rule'], correct: 1, explanation: '$x^2 - 25 = (x-5)(x+5)$ factors nicely.' },
            { topic: '1.7', type: 'multiple_choice', stem: 'To find $\\lim_{x \\to 9} \\frac{\\sqrt{x} - 3}{x - 9}$, best approach:', choices: ['Direct substitution', 'Factor $x - 9$', 'Note $x - 9 = (\\sqrt{x}-3)(\\sqrt{x}+3)$', 'Use table'], correct: 2, explanation: 'Recognizing $x - 9 = (\\sqrt{x}-3)(\\sqrt{x}+3)$ allows cancellation.' },
            { topic: '1.7', type: 'multiple_choice', stem: 'If direct substitution gives a number (not $0/0$ or $k/0$):', choices: ['Limit DNE', 'That\'s the limit', 'Factor first', 'Limit is $0$'], correct: 1, explanation: 'When direct substitution works, that result IS the limit.' },
            { topic: '1.7', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$ should be rewritten as:', choices: ['$\\frac{\\sin 5}{0}$', '$5 \\cdot \\frac{\\sin(5x)}{5x}$', '$\\sin 5$', '$\\frac{5x}{\\sin(5x)}$'], correct: 1, explanation: 'Rewrite as $5 \\cdot \\frac{\\sin(5x)}{5x} \\to 5 \\cdot 1 = 5$' },
            { topic: '1.7', type: 'multiple_choice', stem: 'For $\\lim_{x \\to 4} \\frac{x - 4}{\\sqrt{x} - 2}$, best strategy:', choices: ['Direct substitution', 'Multiply by conjugate', 'Factor as $(\\sqrt{x}-2)(\\sqrt{x}+2)$', 'L\'Hôpital'], correct: 2, explanation: '$x - 4 = (\\sqrt{x}-2)(\\sqrt{x}+2)$, then cancel.' },
            { topic: '1.7', type: 'multiple_choice', stem: 'If $\\lim_{x \\to 3} f(x)$ gives $\\frac{5}{0}$:', choices: ['$= 5$', '$= 0$', '$= \\pm\\infty$ or DNE', '$= 5/0$'], correct: 2, explanation: 'Nonzero over zero indicates vertical asymptote: $\\pm\\infty$ or DNE.' },
            { topic: '1.7', type: 'multiple_choice', stem: '$\\lim_{x \\to 1} \\frac{x^{1/3} - 1}{x - 1}$ uses:', choices: ['$x - 1 = (x^{1/3})^3 - 1$', '$x^{1/3} - 1 = (x-1)^{1/3}$', 'Direct substitution', 'Rationalization'], correct: 0, explanation: 'Use $a^3 - b^3 = (a-b)(a^2+ab+b^2)$ factoring.' },
            { topic: '1.7', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} =$', choices: ['$0$', '$1$', '$-1$', 'DNE'], correct: 0, explanation: 'Standard limit: $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0$' },
            { topic: '1.7', type: 'matching', stem: 'Match each limit expression with the best technique:', pairs: [{ left: '$\\frac{x^2-4}{x-2}$', right: 'Factor' }, { left: '$\\frac{\\sqrt{x+1}-1}{x}$', right: 'Rationalize' }, { left: '$\\frac{\\sin x}{x}$', right: 'Special trig limit' }], explanation: 'Polynomial quotients often factor. Square root expressions need rationalizing. Trig limits like $\\frac{\\sin x}{x}$ use the special limit theorem.' },

            // Topic 1.8
            { topic: '1.8', type: 'multiple_choice', stem: 'Squeeze Theorem requires:', choices: ['$f = g = h$', '$g \\leq f \\leq h$ and $\\lim g = \\lim h = L$', '$f, g, h$ all continuous', 'All equal at $c$'], correct: 1, explanation: 'If $g \\leq f \\leq h$ and both bounds approach $L$, so does $f$.' },
            { topic: '1.8', type: 'multiple_choice', stem: 'For $\\lim_{x \\to 0} x^2 \\sin(1/x)$, we use:', choices: ['$\\sin(1/x) \\to 0$', '$-x^2 \\leq x^2\\sin(1/x) \\leq x^2$', '$x^2 \\to \\infty$', 'Direct substitution'], correct: 1, explanation: 'Since $|\\sin| \\leq 1$: $-x^2 \\leq x^2\\sin(1/x) \\leq x^2 \\to 0$' },
            { topic: '1.8', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} x \\cos(1/x) =$', choices: ['$1$', '$0$', '$-1$', 'DNE'], correct: 1, explanation: '$-|x| \\leq x\\cos(1/x) \\leq |x|$, both bounds $\\to 0$.' },
            { topic: '1.8', type: 'multiple_choice', stem: 'To prove $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, show:', choices: ['$\\sin x = x$ near 0', '$\\frac{\\sin x}{x} = 1$ for small $x$', '$\\cos x \\leq \\frac{\\sin x}{x} \\leq 1$', '$0 \\leq \\frac{\\sin x}{x} \\leq 2$'], correct: 2, explanation: 'Geometry shows $\\cos x \\leq \\frac{\\sin x}{x} \\leq 1$; both bounds $\\to 1$.' },
            { topic: '1.8', type: 'multiple_choice', stem: 'If $g \\leq f \\leq h$, $\\lim g = 2$, $\\lim h = 4$, then $\\lim f$:', choices: ['$= 3$', '$= 2$', '$= 4$', 'Squeeze doesn\'t apply'], correct: 3, explanation: 'Squeeze needs EQUAL bounding limits. $2 \\neq 4$, so can\'t conclude.' },
            { topic: '1.8', type: 'multiple_choice', stem: '$\\lim_{x \\to 0^+} \\sqrt{x} \\sin(1/x) =$', choices: ['$1$', '$0$', '$\\infty$', 'DNE'], correct: 1, explanation: '$-\\sqrt{x} \\leq \\sqrt{x}\\sin(1/x) \\leq \\sqrt{x} \\to 0$' },
            { topic: '1.8', type: 'multiple_choice', stem: 'Why doesn\'t Squeeze apply directly to $\\lim_{x \\to 0} \\sin(1/x)$?', choices: ['Not defined at 0', 'Oscillates without bound', 'Bounds don\'t squeeze to same limit', 'Only for polynomials'], correct: 2, explanation: 'Bounds $-1$ and $1$ don\'t approach same value.' },
            { topic: '1.8', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{\\sin x}{x} =$', choices: ['$1$', '$0$', '$\\infty$', 'DNE'], correct: 1, explanation: '$-\\frac{1}{x} \\leq \\frac{\\sin x}{x} \\leq \\frac{1}{x} \\to 0$' },

            // Topic 1.9
            { topic: '1.9', type: 'multiple_choice', stem: 'Graph shows hole at $(3, 5)$ and solid point at $(3, 2)$. $\\lim_{x \\to 3} f(x) =$', choices: ['$2$', '$3$', '$5$', 'DNE'], correct: 2, explanation: 'Hole shows where curve approaches (5), solid shows $f(3) = 2$.' },
            { topic: '1.9', type: 'multiple_choice', stem: 'For $f(x) = \\frac{|x|}{x}$, $\\lim_{x \\to 0} f(x)$:', choices: ['$= 1$', '$= -1$', '$= 0$', 'DNE'], correct: 3, explanation: 'For $x > 0$: 1. For $x < 0$: $-1$. Different, so DNE.' },
            { topic: '1.9', type: 'multiple_choice', stem: 'If algebra gives $\\lim_{x \\to 2} = 4$, a table should show:', choices: ['Values approaching 2', 'Values approaching 4', 'Values approaching 0', 'Different values each side'], correct: 1, explanation: 'Table values should approach 4 from both sides.' },
            { topic: '1.9', type: 'multiple_choice', stem: 'If $f$ is continuous at $c$:', choices: ['Limit might not exist', 'Limit exists and equals $f(c)$', 'Limit $= 0$', 'No graph at $c$'], correct: 1, explanation: 'By definition: continuous means $\\lim f(x) = f(c)$.' },
            { topic: '1.9', type: 'multiple_choice', stem: '$f(x) = \\begin{cases} 2x & x \\leq 1 \\\\ x + 1 & x > 1 \\end{cases}$ at $x = 1$:', choices: ['Continuous', 'Jump discontinuity', 'Removable discontinuity', 'Infinite discontinuity'], correct: 0, explanation: 'Left $= 2$, right $= 2$, $f(1) = 2$. All equal: continuous.' },
            { topic: '1.9', type: 'multiple_choice', stem: 'Graph shows $f \\to 3$ as $x \\to 5$ both sides. Table: $f(4.999) = 2.999$, $f(5.001) = 3.001$. These:', choices: ['Contradict', 'Both support limit $= 3$', 'Show limit DNE', 'Show $f(5) = 3$'], correct: 1, explanation: 'Both representations show values approaching 3.' },
            { topic: '1.9', type: 'multiple_choice', stem: 'If algebra gives $\\lim_{x \\to 4} f(x) = 7$, graph should show:', choices: ['Maximum at $(4, 7)$', 'Curve approaching height 7 at $x = 4$', 'Vertical asymptote', 'Point at $(7, 4)$'], correct: 1, explanation: 'Limit = 7 means curve approaches $y = 7$ as $x \\to 4$.' },
            { topic: '1.9', type: 'multiple_choice', stem: 'Table: $f(2.9)=5.1$, $f(2.99)=5.01$, $f(3)=$ERROR, $f(3.01)=4.99$. Conclude:', choices: ['$\\lim = 5$', 'Limit DNE', '$f(3) = 5$', 'Continuous at 3'], correct: 0, explanation: 'From both sides approaching 5. Even though $f(3)$ undefined, limit is 5.' },

            // Topic 1.10
            { topic: '1.10', type: 'multiple_choice', stem: 'Removable discontinuity occurs when:', choices: ['One-sided limits differ', 'Function approaches infinity', 'Limit exists but doesn\'t equal $f(c)$', 'Function is continuous'], correct: 2, explanation: 'Removable: limit exists, but $f(c)$ undefined or different.' },
            { topic: '1.10', type: 'multiple_choice', stem: '$f(x) = \\frac{x^2 - 1}{x - 1}$ at $x = 1$ has:', choices: ['No discontinuity', 'Removable discontinuity', 'Jump discontinuity', 'Infinite discontinuity'], correct: 1, explanation: 'Limit $= 2$ exists, but $f(1)$ undefined. Removable (hole).' },
            { topic: '1.10', type: 'multiple_choice', stem: 'Greatest integer function $\\lfloor x \\rfloor$ at integers has:', choices: ['Removable', 'Jump', 'Infinite', 'No discontinuity'], correct: 1, explanation: 'At integer $n$: left limit $= n-1$, right limit $= n$. Different: jump.' },
            { topic: '1.10', type: 'multiple_choice', stem: '$f(x) = \\frac{1}{x - 2}$ at $x = 2$ has:', choices: ['Removable', 'Jump', 'Infinite', 'No discontinuity'], correct: 2, explanation: 'As $x \\to 2$, $f \\to \\pm\\infty$. Vertical asymptote = infinite discontinuity.' },
            { topic: '1.10', type: 'multiple_choice', stem: 'Which CANNOT be fixed by redefining at one point?', choices: ['Removable', 'Hole in graph', 'Jump', 'Where limit exists'], correct: 2, explanation: 'Jump has different one-sided limits—can\'t fix with one value.' },
            { topic: '1.10', type: 'multiple_choice', stem: 'At $x = 0$, $f(x) = \\frac{\\sin x}{x}$ has:', choices: ['Jump', 'Infinite', 'Removable', 'No discontinuity'], correct: 2, explanation: '$f(0)$ undefined, but limit $= 1$ exists. Removable.' },
            { topic: '1.10', type: 'multiple_choice', stem: 'Classify $f(x) = \\frac{|x - 3|}{x - 3}$ at $x = 3$:', choices: ['Removable', 'Jump', 'Infinite', 'None'], correct: 1, explanation: 'For $x > 3$: 1. For $x < 3$: $-1$. Different one-sided limits: jump.' },
            { topic: '1.10', type: 'multiple_choice', stem: '$f(x) = \\frac{x}{x^2} = \\frac{1}{x}$ at $x = 0$ has:', choices: ['Removable', 'Jump', 'Infinite', 'None'], correct: 2, explanation: 'As $x \\to 0$, $\\frac{1}{x} \\to \\pm\\infty$. Infinite discontinuity.' },

            // Topic 1.11
            { topic: '1.11', type: 'multiple_choice', stem: 'Continuity at $c$ requires how many conditions?', choices: ['One', 'Two', 'Three', 'Four'], correct: 2, explanation: 'Three: (1) $f(c)$ defined, (2) limit exists, (3) limit $= f(c)$.' },
            { topic: '1.11', type: 'multiple_choice', stem: 'If $f(2) = 5$ and $\\lim_{x \\to 2} f(x) = 5$, then $f$ is:', choices: ['Discontinuous at 2', 'Continuous at 2', 'Has removable discontinuity', 'Cannot determine'], correct: 1, explanation: 'All three conditions met: continuous at $x = 2$.' },
            { topic: '1.11', type: 'multiple_choice', stem: 'Is $f(x) = x^2 + 3x - 1$ continuous at $x = 4$?', choices: ['Yes, because it\'s a polynomial', 'No', 'Only if we check limit', 'No, has two $x$ terms'], correct: 0, explanation: 'Polynomials are continuous everywhere.' },
            { topic: '1.11', type: 'multiple_choice', stem: 'If $\\lim_{x \\to 3} f(x) = 7$ but $f(3)$ undefined, at $x = 3$:', choices: ['Jump', 'Infinite', 'Removable', 'None'], correct: 2, explanation: 'Limit exists but no function value: removable discontinuity.' },
            { topic: '1.11', type: 'multiple_choice', stem: '$f(x) = \\frac{x + 1}{x - 3}$ is continuous at $x = 5$ because:', choices: ['$f(5) = 3$', 'Denominator $\\neq 0$ at $x = 5$', 'It\'s rational', 'Both A and B'], correct: 3, explanation: 'Rational, denominator $= 2 \\neq 0$, and $f(5) = 3$.' },
            { topic: '1.11', type: 'multiple_choice', stem: 'Which is continuous everywhere?', choices: ['$1/x$', '$\\tan x$', '$e^x$', '$\\ln x$'], correct: 2, explanation: '$e^x$ continuous for all real numbers.' },
            { topic: '1.11', type: 'multiple_choice', stem: 'If $f$ continuous at $c$ and $g$ continuous at $f(c)$, then $g(f(x))$ is:', choices: ['Not necessarily continuous', 'Continuous at $c$', 'Continuous everywhere', 'Undefined'], correct: 1, explanation: 'Composition of continuous functions is continuous.' },
            { topic: '1.11', type: 'multiple_choice', stem: '$f(x) = \\begin{cases} x^2 & x \\neq 2 \\\\ 3 & x = 2 \\end{cases}$ at $x = 2$:', choices: ['Continuous', 'Not continuous: $\\lim \\neq f(2)$', 'Not continuous: limit DNE', 'Not continuous: $f(2)$ undefined'], correct: 1, explanation: '$\\lim = 4$ but $f(2) = 3$. $4 \\neq 3$: not continuous.' },

            // Topic 1.12
            { topic: '1.12', type: 'multiple_choice', stem: 'For continuity on closed interval $[a, b]$, at endpoints use:', choices: ['Two-sided limits', 'One-sided limits', 'Derivative', 'Function $= 0$'], correct: 1, explanation: 'At $a$: right limit; at $b$: left limit.' },
            { topic: '1.12', type: 'multiple_choice', stem: 'Is $\\sqrt{x}$ continuous on $[0, 9]$?', choices: ['No, $f(0) = 0$', 'No, not polynomial', 'Yes', 'Only on $(0, 9)$'], correct: 2, explanation: '$\\sqrt{x}$ continuous on $(0,9)$ and one-sided limits match at endpoints.' },
            { topic: '1.12', type: 'multiple_choice', stem: '$f(x) = \\frac{1}{x - 2}$ is continuous on:', choices: ['$[0, 3]$', '$[0, 2]$', '$[3, 5]$', '$(-\\infty, \\infty)$'], correct: 2, explanation: 'Discontinuous at $x = 2$. $[3, 5]$ avoids this.' },
            { topic: '1.12', type: 'multiple_choice', stem: 'Polynomials are continuous on:', choices: ['$[0, \\infty)$', 'Where positive', '$(-\\infty, \\infty)$', 'Integer points'], correct: 2, explanation: 'Polynomials continuous on entire real line.' },
            { topic: '1.12', type: 'multiple_choice', stem: '$f(x) = \\begin{cases} 3x - 1 & x < 2 \\\\ 5 & x = 2 \\\\ x^2 + 1 & x > 2 \\end{cases}$ on $[0, 4]$:', choices: ['Continuous', 'Discontinuous at $x = 2$', 'Discontinuous at $x = 0$', 'Discontinuous at $x = 4$'], correct: 0, explanation: 'Left limit $= 5$, right limit $= 5$, $f(2) = 5$. All equal: continuous!' },
            { topic: '1.12', type: 'multiple_choice', stem: '$\\ln x$ is continuous on:', choices: ['$(-\\infty, \\infty)$', '$[0, \\infty)$', '$(0, \\infty)$', '$[-1, 1]$'], correct: 2, explanation: '$\\ln x$ defined and continuous for $x > 0$.' },
            { topic: '1.12', type: 'multiple_choice', stem: 'If $f$ continuous on $[1, 5]$, definitely continuous at:', choices: ['$x = 0$', '$x = 3$', '$x = 6$', '$x = -1$'], correct: 1, explanation: '$x = 3$ is in $[1, 5]$, so $f$ is continuous there.' },
            { topic: '1.12', type: 'multiple_choice', stem: 'If $f$ and $g$ continuous on $[a, b]$, then $f + g$ is:', choices: ['Not necessarily continuous', 'Continuous on $[a, b]$', 'Continuous only at $a$ and $b$', 'Continuous only if $f = g$'], correct: 1, explanation: 'Sum of continuous functions is continuous.' },

            // Topic 1.13
            { topic: '1.13', type: 'multiple_choice', stem: 'To remove discontinuity from $\\frac{x^2 - 9}{x - 3}$ at $x = 3$, define $f(3) =$', choices: ['$0$', '$3$', '$6$', '$9$'], correct: 2, explanation: 'Limit $= 6$. Define $f(3) = 6$ to make continuous.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'For $f(x) = \\begin{cases} x + 1 & x < 2 \\\\ k & x = 2 \\\\ x^2 - 1 & x > 2 \\end{cases}$ to be continuous, $k =$', choices: ['$2$', '$3$', 'No value works', '$4$'], correct: 1, explanation: 'Left limit $= 3$, right limit $= 3$. So $k = 3$.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'For $f(x) = \\begin{cases} ax^2 & x \\leq 1 \\\\ 4x - 2 & x > 1 \\end{cases}$ continuous, $a =$', choices: ['$1$', '$2$', '$3$', '$4$'], correct: 1, explanation: 'Need $a(1)^2 = 4(1) - 2 = 2$. So $a = 2$.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'Which type can be removed?', choices: ['Jump', 'Infinite', 'Removable', 'All'], correct: 2, explanation: 'Only removable discontinuities (where limit exists) can be fixed.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'For $\\frac{x^2 - 4}{x - 2}$ with $f(2) = b$ continuous, $b =$', choices: ['$0$', '$2$', '$4$', '$6$'], correct: 2, explanation: 'Limit $= 4$. Set $b = 4$.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'Can $\\frac{1}{x}$ discontinuity at $x = 0$ be removed?', choices: ['Yes, $f(0) = 0$', 'Yes, $f(0) = 1$', 'No, infinite discontinuity', 'No, jump'], correct: 2, explanation: 'Infinite discontinuity—limit doesn\'t exist as finite number.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'For $f(x) = \\begin{cases} 3 - x & x < 1 \\\\ ax + b & x \\geq 1 \\end{cases}$ continuous with $f(1) = 2$, $a + b =$', choices: ['$1$', '$2$', '$3$', '$4$'], correct: 1, explanation: 'Continuity: $a + b = f(1) = 2$.' },
            { topic: '1.13', type: 'multiple_choice', stem: 'Continuous extension of $\\frac{\\sin x}{x}$ at $x = 0$:', choices: ['$f(0) = 0$', '$f(0) = 1$', '$f(0) = \\infty$', 'Cannot extend'], correct: 1, explanation: 'Limit $= 1$, so define $f(0) = 1$.' },

            // Topic 1.14
            { topic: '1.14', type: 'multiple_choice', stem: 'Vertical asymptote occurs where function:', choices: ['Equals zero', 'Approaches $\\pm\\infty$', 'Is continuous', 'Has maximum'], correct: 1, explanation: 'VA is where function grows without bound.' },
            { topic: '1.14', type: 'multiple_choice', stem: 'VA of $f(x) = \\frac{x}{x^2 - 4}$:', choices: ['$x = 0$', '$x = 2$', '$x = -2$', '$x = 2$ and $x = -2$'], correct: 3, explanation: 'Denominator $= 0$ at $x = \\pm 2$, numerator $\\neq 0$ there.' },
            { topic: '1.14', type: 'multiple_choice', stem: 'For $\\frac{1}{x - 3}$, $\\lim_{x \\to 3^+} =$', choices: ['$0$', '$+\\infty$', '$-\\infty$', 'DNE'], correct: 1, explanation: '$x - 3$ small positive → large positive result.' },
            { topic: '1.14', type: 'multiple_choice', stem: 'For $\\frac{1}{x - 3}$, $\\lim_{x \\to 3^-} =$', choices: ['$0$', '$+\\infty$', '$-\\infty$', 'DNE'], correct: 2, explanation: '$x - 3$ small negative → large negative result.' },
            { topic: '1.14', type: 'multiple_choice', stem: 'For $\\frac{x + 1}{(x - 2)^2}$, $\\lim_{x \\to 2} =$', choices: ['$+\\infty$', '$-\\infty$', '$0$', 'DNE'], correct: 0, explanation: 'Numerator $= 3 > 0$, denominator positive → $+\\infty$.' },
            { topic: '1.14', type: 'multiple_choice', stem: 'Does $\\frac{x^2 - 4}{x - 2}$ have VA at $x = 2$?', choices: ['Yes, denominator $= 0$', 'No, both num and denom $= 0$', 'Yes, undefined there', 'Cannot determine'], correct: 1, explanation: 'Both $= 0$: it\'s a hole, not asymptote.' },
            { topic: '1.14', type: 'multiple_choice', stem: '$\\tan x$ has VA at:', choices: ['$x = n\\pi$', '$x = \\frac{\\pi}{2} + n\\pi$', '$x = 0$', '$x = \\pi$'], correct: 1, explanation: '$\\tan x = \\frac{\\sin x}{\\cos x}$; VA where $\\cos x = 0$.' },
            { topic: '1.14', type: 'multiple_choice', stem: 'For $\\frac{-3}{(x+1)^3}$, $\\lim_{x \\to -1^+} =$', choices: ['$+\\infty$', '$-\\infty$', '$0$', '$-3$'], correct: 1, explanation: '$(x+1)^3$ small positive, $-3$ over that → $-\\infty$.' },

            // Topic 1.15
            { topic: '1.15', type: 'multiple_choice', stem: 'Horizontal asymptote describes behavior as:', choices: ['$x \\to 0$', '$x \\to$ finite', '$x \\to \\pm\\infty$', '$y \\to 0$'], correct: 2, explanation: 'HA describes end behavior as $x \\to \\pm\\infty$.' },
            { topic: '1.15', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{3x^2 + 1}{5x^2 - 2} =$', choices: ['$0$', '$3/5$', '$1$', '$\\infty$'], correct: 1, explanation: 'Equal degrees: divide leading coefficients $= 3/5$.' },
            { topic: '1.15', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{2x + 5}{x^3 - 1} =$', choices: ['$0$', '$2$', '$\\infty$', 'DNE'], correct: 0, explanation: 'Numerator degree < denominator: limit $= 0$.' },
            { topic: '1.15', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{x^3 + 2x}{4x^2 - 1} =$', choices: ['$0$', '$1/4$', '$\\infty$', '$-\\infty$'], correct: 2, explanation: 'Numerator degree > denominator: limit $= \\infty$.' },
            { topic: '1.15', type: 'multiple_choice', stem: '$\\lim_{x \\to -\\infty} \\frac{x^2 + 1}{x - 3} =$', choices: ['$+\\infty$', '$-\\infty$', '$0$', '$1$'], correct: 1, explanation: 'Large positive over large negative → $-\\infty$.' },
            { topic: '1.15', type: 'multiple_choice', stem: 'HA of $\\frac{2x^2 - 3x}{x^2 + 1}$:', choices: ['$y = 0$', '$y = 2$', '$y = -3$', 'None'], correct: 1, explanation: 'Equal degrees: HA at $y = 2/1 = 2$.' },
            { topic: '1.15', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{5}{x^2 + 1} =$', choices: ['$0$', '$5$', '$\\infty$', 'DNE'], correct: 0, explanation: 'Constant over growing denominator → $0$.' },
            { topic: '1.15', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{\\sqrt{4x^2 + 1}}{x + 2} =$', choices: ['$0$', '$2$', '$4$', '$\\infty$'], correct: 1, explanation: '$\\sqrt{4x^2} \\approx 2x$, so $\\frac{2x}{x} = 2$.' },

            // Topic 1.16
            { topic: '1.16', type: 'multiple_choice', stem: 'IVT requires function to be:', choices: ['Differentiable', 'Continuous on closed interval', 'Positive', 'Polynomial'], correct: 1, explanation: 'IVT needs continuity on $[a, b]$.' },
            { topic: '1.16', type: 'multiple_choice', stem: 'If $f$ continuous on $[0, 3]$, $f(0) = -2$, $f(3) = 4$, IVT guarantees:', choices: ['$f(c) = -3$ for some $c$', '$f(c) = 0$ for some $c$', '$f(c) = 5$ for some $c$', '$f\'(c) = 0$'], correct: 1, explanation: '$0$ is between $-2$ and $4$, so IVT guarantees $f(c) = 0$.' },
            { topic: '1.16', type: 'multiple_choice', stem: 'To show $x^3 - 3x + 1 = 0$ has root in $[0, 1]$:', choices: ['$f(0) = f(1)$', '$f(0)$ and $f(1)$ opposite signs', '$f(0) > 0$ and $f(1) > 0$', '$f$ is polynomial'], correct: 1, explanation: 'Opposite signs means $0$ is between them; IVT gives root.' },
            { topic: '1.16', type: 'multiple_choice', stem: '$f(x) = x^3 - 2x - 2$: $f(1) = -3$, $f(2) = 2$. Root in:', choices: ['$[0, 1]$', '$(1, 2)$', '$[2, 3]$', 'Cannot determine'], correct: 1, explanation: 'Opposite signs at $1$ and $2$; root in $(1, 2)$.' },
            { topic: '1.16', type: 'multiple_choice', stem: 'IVT guarantees existence but NOT:', choices: ['That $c$ exists', 'What $c$ equals exactly', 'That $f(c) = k$', 'All above'], correct: 1, explanation: 'IVT is existence theorem—doesn\'t give exact value.' },
            { topic: '1.16', type: 'multiple_choice', stem: 'Can\'t use IVT on $\\frac{1}{x}$ on $[-1, 1]$ because:', choices: ['$f$ never $= 0$', '$f$ not continuous on $[-1, 1]$', '$0$ not between $f(-1)$ and $f(1)$', 'Both A and B'], correct: 3, explanation: 'Two problems: discontinuous at $0$, and $1/x$ never equals $0$.' },
            { topic: '1.16', type: 'multiple_choice', stem: '$f$ continuous on $[2, 5]$, $f(2) = 7$, $f(5) = 3$. NOT guaranteed:', choices: ['$f(c) = 4$', '$f(c) = 5$', '$f(c) = 6$', '$f(c) = 8$'], correct: 3, explanation: 'IVT guarantees values between $3$ and $7$. $8$ is outside.' },
            { topic: '1.16', type: 'multiple_choice', stem: '$g$ continuous on $[0, 2]$ with $g(0) = g(2) = 1$. Conclude:', choices: ['$g$ has root', '$g(1) = 1$', 'Nothing specific', '$g$ achieves all values between min and max'], correct: 3, explanation: 'IVT: continuous function takes all values between its min and max.' },

            // ========== UNIT 2: DIFFERENTIATION ==========
            // Topic 2.1
            { topic: '2.1', type: 'multiple_choice', stem: 'The instantaneous rate of change of $f$ at $x = a$ is:', choices: ['$\\frac{f(b) - f(a)}{b - a}$', '$\\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$', '$f(a+1) - f(a)$', '$f(a) \\cdot a$'], correct: 1, explanation: 'Instantaneous rate = limit of average rate as interval shrinks to zero.' },
            { topic: '2.1', type: 'multiple_choice', stem: 'Average rate of change of $f(x) = x^3$ from $x = 1$ to $x = 2$:', choices: ['$3$', '$7$', '$8$', '$1$'], correct: 1, explanation: '$\\frac{f(2) - f(1)}{2 - 1} = \\frac{8 - 1}{1} = 7$' },
            { topic: '2.1', type: 'multiple_choice', stem: 'If $f(x) = 2x + 5$, the instantaneous rate at any point is:', choices: ['$5$', '$2$', '$2x$', 'Depends on $x$'], correct: 1, explanation: 'For linear functions, rate of change equals slope = 2.' },
            { topic: '2.1', type: 'multiple_choice', stem: '$\\lim_{h \\to 0} \\frac{(3+h)^2 - 9}{h}$ represents:', choices: ['Average rate of $x^2$ on $[0, 3]$', 'Instantaneous rate of $x^2$ at $x = 3$', 'Value of $x^2$ at $x = 3$', 'Slope of secant line'], correct: 1, explanation: 'This is the definition of instantaneous rate of $f(x) = x^2$ at $x = 3$.' },
            { topic: '2.1', type: 'multiple_choice', stem: 'Average velocity from $t = 0$ to $t = 4$ if $s(t) = t^2 + 1$:', choices: ['$4$', '$8$', '$17$', '$\\frac{17}{4}$'], correct: 0, explanation: '$\\frac{s(4) - s(0)}{4 - 0} = \\frac{17 - 1}{4} = 4$' },
            { topic: '2.1', type: 'multiple_choice', stem: 'As $h \\to 0$, $\\frac{f(a+h) - f(a)}{h}$ becomes:', choices: ['The average rate', 'The instantaneous rate', 'Zero', 'Undefined'], correct: 1, explanation: 'The limit transforms average rate into instantaneous rate.' },
            { topic: '2.1', type: 'multiple_choice', stem: 'For $f(x) = \\sqrt{x}$, $\\frac{f(4) - f(1)}{4 - 1} =$', choices: ['$\\frac{1}{3}$', '$\\frac{1}{2}$', '$1$', '$3$'], correct: 0, explanation: '$\\frac{2 - 1}{3} = \\frac{1}{3}$' },
            { topic: '2.1', type: 'multiple_choice', stem: 'The slope of the secant line from $(a, f(a))$ to $(b, f(b))$ equals:', choices: ['$f\'(a)$', '$\\frac{f(b) - f(a)}{b - a}$', '$f(b) - f(a)$', '$\\frac{b - a}{f(b) - f(a)}$'], correct: 1, explanation: 'Secant slope = rise/run = average rate of change.' },

            // Topic 2.2
            { topic: '2.2', type: 'multiple_choice', stem: 'The derivative $f\'(a)$ represents:', choices: ['Value of $f$ at $a$', 'Slope of tangent line at $a$', 'Area under curve', 'Average value'], correct: 1, explanation: 'The derivative gives the slope of the tangent line.' },
            { topic: '2.2', type: 'multiple_choice', stem: '$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$ is called:', choices: ['Average rate', 'Difference quotient', 'Definition of derivative', 'Secant slope'], correct: 2, explanation: 'This limit defines the derivative of $f$ at $x$.' },
            { topic: '2.2', type: 'multiple_choice', stem: 'If $f(x) = 5$, then $f\'(x) =$', choices: ['$5$', '$0$', '$1$', '$5x$'], correct: 1, explanation: 'Derivative of a constant is zero.' },
            { topic: '2.2', type: 'multiple_choice', stem: 'Find $f\'(x)$ if $f(x) = x$:', choices: ['$0$', '$1$', '$x$', '$2x$'], correct: 1, explanation: '$\\lim_{h \\to 0} \\frac{(x+h) - x}{h} = \\lim_{h \\to 0} 1 = 1$' },
            { topic: '2.2', type: 'multiple_choice', stem: '$\\frac{dy}{dx}$ is the same as:', choices: ['$y \\cdot x$', '$\\frac{y}{x}$', '$y\'$', 'None'], correct: 2, explanation: '$\\frac{dy}{dx}$ is Leibniz notation for derivative.' },
            { topic: '2.2', type: 'multiple_choice', stem: 'Using definition, $\\frac{d}{dx}(x^2) =$', choices: ['$x$', '$2x$', '$x^2$', '$2$'], correct: 1, explanation: '$\\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h} = \\lim_{h \\to 0} (2x + h) = 2x$' },
            { topic: '2.2', type: 'multiple_choice', stem: 'If the tangent line at $(2, f(2))$ has slope $5$, then $f\'(2) =$', choices: ['$2$', '$5$', '$10$', 'Cannot determine'], correct: 1, explanation: 'Derivative at a point = slope of tangent there.' },
            { topic: '2.2', type: 'multiple_choice', stem: 'The notation $Df(x)$ means:', choices: ['$f(x) \\cdot D$', '$f\'(x)$', 'Distance', 'Difference'], correct: 1, explanation: '$D$ is the differential operator; $Df(x) = f\'(x)$.' },

            // Topic 2.3
            { topic: '2.3', type: 'multiple_choice', stem: 'To estimate $f\'(3)$ from a table, use:', choices: ['$f(3)$', '$\\frac{f(3.1) - f(2.9)}{0.2}$', '$f(3.1) - f(2.9)$', '$f(4) - f(2)$'], correct: 1, explanation: 'Symmetric difference quotient gives best estimate.' },
            { topic: '2.3', type: 'multiple_choice', stem: 'If $f(2) = 5$, $f(2.01) = 5.03$, estimate $f\'(2)$:', choices: ['$0.03$', '$3$', '$5$', '$0.01$'], correct: 1, explanation: '$\\frac{5.03 - 5}{0.01} = \\frac{0.03}{0.01} = 3$' },
            { topic: '2.3', type: 'multiple_choice', stem: 'From a graph, $f\'(a)$ is estimated by:', choices: ['Height at $a$', 'Slope of tangent at $a$', 'Area under curve', 'Maximum value'], correct: 1, explanation: 'The derivative is the slope of the tangent line.' },
            { topic: '2.3', type: 'multiple_choice', stem: 'If tangent line at $x = 4$ is horizontal, then $f\'(4) =$', choices: ['$4$', '$1$', '$0$', 'Undefined'], correct: 2, explanation: 'Horizontal tangent has slope 0.' },
            { topic: '2.3', type: 'multiple_choice', stem: '$f(1) = 2$, $f(1.5) = 4$. Average rate on $[1, 1.5]$:', choices: ['$2$', '$4$', '$6$', '$1$'], correct: 1, explanation: '$\\frac{4 - 2}{1.5 - 1} = \\frac{2}{0.5} = 4$' },
            { topic: '2.3', type: 'multiple_choice', stem: 'Better estimate of $f\'(5)$: $\\frac{f(5.1)-f(5)}{0.1}$ or $\\frac{f(5.01)-f(5)}{0.01}$?', choices: ['First', 'Second', 'Same', 'Cannot compare'], correct: 1, explanation: 'Smaller $h$ gives better approximation.' },
            { topic: '2.3', type: 'multiple_choice', stem: 'If graph of $f$ is decreasing at $x = 2$, then $f\'(2)$ is:', choices: ['Positive', 'Negative', 'Zero', 'Undefined'], correct: 1, explanation: 'Decreasing function has negative derivative.' },
            { topic: '2.3', type: 'multiple_choice', stem: 'Tangent line slope at inflection point could be:', choices: ['Only zero', 'Only positive', 'Any value', 'Only negative'], correct: 2, explanation: 'Inflection point is about concavity change, not slope.' },

            // Topic 2.4
            { topic: '2.4', type: 'multiple_choice', stem: 'If $f$ is differentiable at $a$, then $f$ is:', choices: ['Discontinuous at $a$', 'Continuous at $a$', 'Zero at $a$', 'Constant near $a$'], correct: 1, explanation: 'Differentiability implies continuity.' },
            { topic: '2.4', type: 'multiple_choice', stem: 'Is $f(x) = |x|$ differentiable at $x = 0$?', choices: ['Yes', 'No, has corner', 'No, not continuous', 'No, undefined'], correct: 1, explanation: '$|x|$ has a corner at 0; not differentiable there.' },
            { topic: '2.4', type: 'multiple_choice', stem: 'Continuous but not differentiable can occur at:', choices: ['Smooth point', 'Corner or cusp', 'Every point', 'No point'], correct: 1, explanation: 'Corners and cusps are continuous but not differentiable.' },
            { topic: '2.4', type: 'multiple_choice', stem: 'If $f$ has a vertical tangent at $a$:', choices: ['$f\'(a) = 0$', '$f\'(a) = 1$', '$f\'(a)$ is undefined', '$f\'(a) = \\infty$'], correct: 2, explanation: 'Vertical tangent means derivative doesn\'t exist (infinite slope).' },
            { topic: '2.4', type: 'multiple_choice', stem: 'True or False: Continuous implies differentiable.', choices: ['True', 'False'], correct: 1, explanation: 'False. Counterexample: $|x|$ at $x = 0$.' },
            { topic: '2.4', type: 'multiple_choice', stem: '$f(x) = x^{2/3}$ at $x = 0$ has:', choices: ['Normal derivative', 'Corner', 'Cusp', 'Jump'], correct: 2, explanation: '$x^{2/3}$ has a cusp at origin.' },
            { topic: '2.4', type: 'multiple_choice', stem: 'If $f$ is not continuous at $a$, then $f\'(a)$:', choices: ['Equals 0', 'Equals 1', 'Does not exist', 'Is positive'], correct: 2, explanation: 'Discontinuity means no derivative.' },
            { topic: '2.4', type: 'multiple_choice', stem: 'Polynomial functions are differentiable:', choices: ['Nowhere', 'Only at integers', 'Everywhere', 'Only where positive'], correct: 2, explanation: 'Polynomials are smooth everywhere.' },

            // Topic 2.5
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^7) =$', choices: ['$x^6$', '$7x^6$', '$7x^7$', '$6x^7$'], correct: 1, explanation: 'Power rule: bring down exponent, reduce by 1.' },
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^{-3}) =$', choices: ['$-3x^{-4}$', '$-3x^{-2}$', '$3x^{-4}$', '$-4x^{-3}$'], correct: 0, explanation: '$-3 \\cdot x^{-3-1} = -3x^{-4}$' },
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sqrt{x}) =$', choices: ['$\\frac{1}{\\sqrt{x}}$', '$\\frac{1}{2\\sqrt{x}}$', '$2\\sqrt{x}$', '$\\frac{1}{2}x$'], correct: 1, explanation: '$\\frac{d}{dx}(x^{1/2}) = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$' },
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^{-1}) =$', choices: ['$-x^{-2}$', '$x^{-2}$', '$-1$', '$\\frac{1}{x}$'], correct: 0, explanation: '$-1 \\cdot x^{-2} = -x^{-2} = -\\frac{1}{x^2}$' },
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^{4/3}) =$', choices: ['$\\frac{4}{3}x^{1/3}$', '$\\frac{4}{3}x^{4/3}$', '$\\frac{1}{3}x^{4/3}$', '$4x^{1/3}$'], correct: 0, explanation: '$\\frac{4}{3} \\cdot x^{4/3 - 1} = \\frac{4}{3}x^{1/3}$' },
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{1}{x^4}\\right) =$', choices: ['$-4x^{-5}$', '$4x^{-3}$', '$-\\frac{4}{x^3}$', '$\\frac{4}{x^5}$'], correct: 0, explanation: '$\\frac{d}{dx}(x^{-4}) = -4x^{-5}$' },
            { topic: '2.5', type: 'multiple_choice', stem: 'If $f(x) = x^{100}$, then $f\'(1) =$', choices: ['$1$', '$100$', '$99$', '$101$'], correct: 1, explanation: '$f\'(x) = 100x^{99}$, so $f\'(1) = 100$' },
            { topic: '2.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sqrt[3]{x^2}) =$', choices: ['$\\frac{2}{3}x^{-1/3}$', '$\\frac{2}{3}x^{1/3}$', '$\\frac{3}{2}x^{-1/3}$', '$2x^{-1/3}$'], correct: 0, explanation: '$x^{2/3}$ derivative: $\\frac{2}{3}x^{-1/3}$' },

            // Topic 2.6
            { topic: '2.6', type: 'multiple_choice', stem: '$\\frac{d}{dx}(5x^3 - 2x) =$', choices: ['$15x^2 - 2$', '$5x^2 - 2$', '$15x^3 - 2$', '$5x^3 - 2x$'], correct: 0, explanation: '$5(3x^2) - 2(1) = 15x^2 - 2$' },
            { topic: '2.6', type: 'multiple_choice', stem: '$\\frac{d}{dx}(4x^2 + 3x - 7) =$', choices: ['$8x + 3$', '$4x + 3$', '$8x^2 + 3$', '$8x - 7$'], correct: 0, explanation: '$8x + 3 - 0 = 8x + 3$' },
            { topic: '2.6', type: 'multiple_choice', stem: 'If $f\'(x) = 6x^2$ and $g\'(x) = 2x$, then $(f + g)\'(x) =$', choices: ['$12x^3$', '$6x^2 + 2x$', '$8x^2$', '$4x$'], correct: 1, explanation: 'Sum rule: $(f + g)\' = f\' + g\'$' },
            { topic: '2.6', type: 'multiple_choice', stem: '$\\frac{d}{dx}(3f(x))$ where $f\'(x) = x^2$:', choices: ['$3x^2$', '$x^2$', '$6x$', '$3x$'], correct: 0, explanation: 'Constant multiple: $3f\'(x) = 3x^2$' },
            { topic: '2.6', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^5 - x^3 + x - 1) =$', choices: ['$5x^4 - 3x^2 + 1$', '$5x^4 - 3x^2$', '$5x^4 - 3x^2 + x$', '$x^4 - x^2 + 1$'], correct: 0, explanation: 'Apply power rule to each term.' },
            { topic: '2.6', type: 'multiple_choice', stem: 'Derivative of constant $\\pi$ is:', choices: ['$\\pi$', '$0$', '$1$', '$3.14$'], correct: 1, explanation: 'Derivative of any constant is 0.' },
            { topic: '2.6', type: 'multiple_choice', stem: '$\\frac{d}{dx}(2x^4 - \\frac{1}{x}) =$', choices: ['$8x^3 + x^{-2}$', '$8x^3 - x^{-2}$', '$8x^3 + \\frac{1}{x^2}$', '$2x^3 + x^{-2}$'], correct: 0, explanation: '$8x^3 - (-1)x^{-2} = 8x^3 + x^{-2}$' },
            { topic: '2.6', type: 'multiple_choice', stem: 'If $y = 7x^6$, then $\\frac{dy}{dx}$ at $x = 1$:', choices: ['$7$', '$42$', '$6$', '$36$'], correct: 1, explanation: '$y\' = 42x^5$, at $x = 1$: $42$' },

            // Topic 2.7
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sin x) =$', choices: ['$-\\cos x$', '$\\cos x$', '$\\sin x$', '$-\\sin x$'], correct: 1, explanation: 'Derivative of sine is cosine.' },
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\cos x) =$', choices: ['$\\sin x$', '$-\\sin x$', '$\\cos x$', '$-\\cos x$'], correct: 1, explanation: 'Derivative of cosine is negative sine.' },
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^x) =$', choices: ['$xe^{x-1}$', '$e^x$', '$e$', '$xe^x$'], correct: 1, explanation: '$e^x$ is its own derivative.' },
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\ln x) =$', choices: ['$\\ln x$', '$\\frac{1}{x}$', '$x$', '$e^x$'], correct: 1, explanation: 'Derivative of natural log is $\\frac{1}{x}$.' },
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(3\\sin x + 2\\cos x) =$', choices: ['$3\\cos x - 2\\sin x$', '$3\\cos x + 2\\sin x$', '$-3\\cos x - 2\\sin x$', '$-3\\sin x + 2\\cos x$'], correct: 0, explanation: '$3\\cos x + 2(-\\sin x) = 3\\cos x - 2\\sin x$' },
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(5e^x - \\ln x) =$', choices: ['$5e^x - \\frac{1}{x}$', '$5e^x + \\frac{1}{x}$', '$e^x - \\frac{1}{x}$', '$5e^x - x$'], correct: 0, explanation: '$5e^x - \\frac{1}{x}$' },
            { topic: '2.7', type: 'multiple_choice', stem: 'At $x = 0$, $\\frac{d}{dx}(\\sin x) =$', choices: ['$0$', '$1$', '$-1$', 'Undefined'], correct: 1, explanation: '$\\cos(0) = 1$' },
            { topic: '2.7', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^x + x^e)$ where $e \\approx 2.718$:', choices: ['$e^x + ex^{e-1}$', '$e^x + x^e$', '$xe^{x-1} + ex^{e-1}$', '$e^x + e$'], correct: 0, explanation: '$e^x$ derivative is $e^x$; $x^e$ uses power rule: $ex^{e-1}$' },
            { topic: '2.7', type: 'matching', stem: 'Match each function with its derivative:', pairs: [{ left: '$\\sin x$', right: '$\\cos x$' }, { left: '$\\cos x$', right: '$-\\sin x$' }, { left: '$e^x$', right: '$e^x$' }, { left: '$\\ln x$', right: '$\\frac{1}{x}$' }], explanation: 'These are the fundamental derivatives of transcendental functions. $\\sin$ becomes $\\cos$, $\\cos$ becomes $-\\sin$, $e^x$ stays as $e^x$, and $\\ln x$ becomes $\\frac{1}{x}$.' },

            // Topic 2.8
            { topic: '2.8', type: 'multiple_choice', stem: 'Product rule: $(fg)\' =$', choices: ['$f\'g\'$', '$f\'g + fg\'$', '$f\'g - fg\'$', '$\\frac{f\'}{g\'}$'], correct: 1, explanation: 'Product rule: derivative of first times second plus first times derivative of second.' },
            { topic: '2.8', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^2 \\cdot e^x) =$', choices: ['$2xe^x$', '$2xe^x + x^2e^x$', '$x^2e^x$', '$2x \\cdot e^x$'], correct: 1, explanation: '$(2x)(e^x) + (x^2)(e^x) = e^x(2x + x^2)$' },
            { topic: '2.8', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x \\sin x) =$', choices: ['$\\cos x$', '$x\\cos x$', '$\\sin x + x\\cos x$', '$\\sin x - x\\cos x$'], correct: 2, explanation: '$(1)(\\sin x) + (x)(\\cos x)$' },
            { topic: '2.8', type: 'multiple_choice', stem: 'If $f(2) = 3$, $f\'(2) = 4$, $g(2) = 5$, $g\'(2) = 6$, find $(fg)\'(2)$:', choices: ['$24$', '$38$', '$20$', '$12$'], correct: 1, explanation: '$f\'(2)g(2) + f(2)g\'(2) = 4(5) + 3(6) = 38$' },
            { topic: '2.8', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^x \\cos x) =$', choices: ['$e^x\\cos x - e^x\\sin x$', '$e^x\\cos x + e^x\\sin x$', '$-e^x\\sin x$', '$e^x(\\cos x - \\sin x)$'], correct: 3, explanation: '$e^x\\cos x + e^x(-\\sin x) = e^x(\\cos x - \\sin x)$' },
            { topic: '2.8', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^3 \\ln x) =$', choices: ['$3x^2 \\ln x$', '$3x^2 \\ln x + x^2$', '$x^2 + 3x^2\\ln x$', '$3x^2/x$'], correct: 1, explanation: '$3x^2 \\ln x + x^3 \\cdot \\frac{1}{x} = 3x^2\\ln x + x^2$' },
            { topic: '2.8', type: 'multiple_choice', stem: 'Common error: $(x \\cdot x^2)\' = x\' \\cdot (x^2)\' = 1 \\cdot 2x = 2x$. Correct?', choices: ['Yes', 'No, should use product rule', 'No, answer is $3x$', 'No, answer is $3x^2$'], correct: 3, explanation: '$x \\cdot x^2 = x^3$, so derivative is $3x^2$. Or use product rule correctly.' },
            { topic: '2.8', type: 'multiple_choice', stem: '$\\frac{d}{dx}[(2x+1)(x-3)] =$', choices: ['$2(x-3) + (2x+1)$', '$2$', '$4x - 5$', '$2x - 6$'], correct: 2, explanation: '$2(x-3) + (2x+1)(1) = 2x - 6 + 2x + 1 = 4x - 5$' },

            // Topic 2.9
            { topic: '2.9', type: 'multiple_choice', stem: 'Quotient rule: $(\\frac{f}{g})\' =$', choices: ['$\\frac{f\'}{g\'}$', '$\\frac{f\'g - fg\'}{g^2}$', '$\\frac{f\'g + fg\'}{g^2}$', '$\\frac{fg\' - f\'g}{g^2}$'], correct: 1, explanation: 'Low d-high minus high d-low, over low squared.' },
            { topic: '2.9', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{x}{x+1}\\right) =$', choices: ['$\\frac{1}{(x+1)^2}$', '$\\frac{x}{(x+1)^2}$', '$\\frac{1}{x+1}$', '$\\frac{-1}{(x+1)^2}$'], correct: 0, explanation: '$\\frac{(1)(x+1) - (x)(1)}{(x+1)^2} = \\frac{1}{(x+1)^2}$' },
            { topic: '2.9', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{e^x}{x}\\right) =$', choices: ['$\\frac{e^x}{x^2}$', '$\\frac{e^x(x-1)}{x^2}$', '$\\frac{e^x - 1}{x}$', '$\\frac{xe^x - e^x}{x^2}$'], correct: 3, explanation: '$\\frac{e^x \\cdot x - e^x \\cdot 1}{x^2} = \\frac{e^x(x-1)}{x^2}$' },
            { topic: '2.9', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{\\sin x}{x}\\right) =$', choices: ['$\\frac{\\cos x}{x}$', '$\\frac{x\\cos x - \\sin x}{x^2}$', '$\\frac{\\sin x - x\\cos x}{x^2}$', '$\\frac{\\cos x - \\sin x}{x}$'], correct: 1, explanation: '$\\frac{(\\cos x)(x) - (\\sin x)(1)}{x^2}$' },
            { topic: '2.9', type: 'multiple_choice', stem: 'If $f(1) = 2$, $f\'(1) = 3$, $g(1) = 4$, $g\'(1) = 5$, find $(f/g)\'(1)$:', choices: ['$\\frac{3}{5}$', '$\\frac{2}{16}$', '$\\frac{1}{8}$', '$\\frac{7}{16}$'], correct: 2, explanation: '$\\frac{3(4) - 2(5)}{16} = \\frac{2}{16} = \\frac{1}{8}$' },
            { topic: '2.9', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{x^2}{\\cos x}\\right) =$', choices: ['$\\frac{2x\\cos x + x^2\\sin x}{\\cos^2 x}$', '$\\frac{2x}{-\\sin x}$', '$\\frac{2x\\cos x - x^2\\sin x}{\\cos^2 x}$', '$2x\\sec x$'], correct: 0, explanation: '$\\frac{2x\\cos x - x^2(-\\sin x)}{\\cos^2 x}$' },
            { topic: '2.9', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{1}{x^2}\\right)$ using quotient rule:', choices: ['$\\frac{-2}{x^3}$', '$\\frac{2}{x^3}$', '$\\frac{-1}{x^3}$', '$-2x^{-3}$'], correct: 3, explanation: '$\\frac{0 - 1(2x)}{x^4} = \\frac{-2x}{x^4} = -2x^{-3}$' },
            { topic: '2.9', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{3x+2}{x-1}\\right) =$', choices: ['$\\frac{-5}{(x-1)^2}$', '$\\frac{5}{(x-1)^2}$', '$\\frac{3}{(x-1)^2}$', '$\\frac{1}{(x-1)^2}$'], correct: 0, explanation: '$\\frac{3(x-1) - (3x+2)(1)}{(x-1)^2} = \\frac{-5}{(x-1)^2}$' },

            // Topic 2.10
            { topic: '2.10', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\tan x) =$', choices: ['$\\sec x$', '$\\sec^2 x$', '$\\cot x$', '$\\sec x \\tan x$'], correct: 1, explanation: 'Derivative of tangent is secant squared.' },
            { topic: '2.10', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sec x) =$', choices: ['$\\sec x$', '$\\tan x$', '$\\sec x \\tan x$', '$\\sec^2 x$'], correct: 2, explanation: 'Derivative of secant is secant times tangent.' },
            { topic: '2.10', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\cot x) =$', choices: ['$\\csc^2 x$', '$-\\csc^2 x$', '$-\\cot x$', '$\\sec^2 x$'], correct: 1, explanation: 'Derivative of cotangent is negative cosecant squared.' },
            { topic: '2.10', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\csc x) =$', choices: ['$-\\csc x \\cot x$', '$\\csc x \\cot x$', '$-\\csc^2 x$', '$\\sec x \\tan x$'], correct: 0, explanation: 'Derivative of cosecant is negative cosecant times cotangent.' },
            { topic: '2.10', type: 'multiple_choice', stem: 'At $x = \\frac{\\pi}{4}$, $\\frac{d}{dx}(\\tan x) =$', choices: ['$1$', '$2$', '$\\sqrt{2}$', '$\\frac{1}{2}$'], correct: 1, explanation: '$\\sec^2(\\pi/4) = (\\sqrt{2})^2 = 2$' },
            { topic: '2.10', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\tan x + \\sec x) =$', choices: ['$\\sec^2 x + \\sec x\\tan x$', '$\\sec x(\\sec x + \\tan x)$', '$2\\sec^2 x$', 'Both A and B'], correct: 3, explanation: 'A and B are equivalent: $\\sec^2 x + \\sec x\\tan x = \\sec x(\\sec x + \\tan x)$' },
            { topic: '2.10', type: 'multiple_choice', stem: 'Derive $\\frac{d}{dx}(\\tan x)$ using quotient rule on $\\frac{\\sin x}{\\cos x}$:', choices: ['$\\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x}$', '$\\frac{1}{\\cos^2 x}$', '$\\sec^2 x$', 'All equivalent'], correct: 3, explanation: 'All three are equivalent to $\\sec^2 x$.' },
            { topic: '2.10', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x\\tan x) =$', choices: ['$\\tan x + x\\sec^2 x$', '$x\\sec^2 x$', '$\\sec^2 x$', '$\\tan x \\cdot \\sec^2 x$'], correct: 0, explanation: 'Product rule: $(1)(\\tan x) + (x)(\\sec^2 x)$' },

            // ========== UNIT 3: ADVANCED DIFFERENTIATION ==========
            // Topic 3.1: Chain Rule
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sin(3x)) =$', choices: ['$\\cos(3x)$', '$3\\cos(3x)$', '$3\\cos x$', '$\\sin(3)\\cos(3x)$'], correct: 1, explanation: 'Chain rule: $\\cos(3x) \\cdot 3 = 3\\cos(3x)$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^{x^2}) =$', choices: ['$e^{x^2}$', '$2xe^{x^2}$', '$e^{2x}$', '$x^2 e^{x^2-1}$'], correct: 1, explanation: 'Chain rule: $e^{x^2} \\cdot 2x = 2xe^{x^2}$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}((2x+1)^5) =$', choices: ['$5(2x+1)^4$', '$10(2x+1)^4$', '$5(2x+1)^4 \\cdot 2x$', '$10x(2x+1)^4$'], correct: 1, explanation: '$5(2x+1)^4 \\cdot 2 = 10(2x+1)^4$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\ln(x^2+1)) =$', choices: ['$\\frac{1}{x^2+1}$', '$\\frac{2x}{x^2+1}$', '$\\frac{2}{x}$', '$\\ln(2x)$'], correct: 1, explanation: '$\\frac{1}{x^2+1} \\cdot 2x = \\frac{2x}{x^2+1}$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\cos^2 x) =$', choices: ['$-2\\cos x$', '$-2\\cos x \\sin x$', '$2\\cos x$', '$-\\sin^2 x$'], correct: 1, explanation: '$2\\cos x \\cdot (-\\sin x) = -2\\cos x \\sin x$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sqrt{4x+1}) =$', choices: ['$\\frac{1}{2\\sqrt{4x+1}}$', '$\\frac{2}{\\sqrt{4x+1}}$', '$\\frac{4}{\\sqrt{4x+1}}$', '$\\frac{1}{\\sqrt{4x+1}}$'], correct: 1, explanation: '$\\frac{1}{2\\sqrt{4x+1}} \\cdot 4 = \\frac{2}{\\sqrt{4x+1}}$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^{\\sin x}) =$', choices: ['$e^{\\cos x}$', '$\\cos x \\cdot e^{\\sin x}$', '$e^{\\sin x}$', '$\\sin x \\cdot e^{\\cos x}$'], correct: 1, explanation: '$e^{\\sin x} \\cdot \\cos x$' },
            { topic: '3.1', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\tan(x^3)) =$', choices: ['$\\sec^2(x^3)$', '$3x^2\\sec^2(x^3)$', '$3\\sec^2(x^3)$', '$x^3\\sec^2(x^3)$'], correct: 1, explanation: '$\\sec^2(x^3) \\cdot 3x^2$' },

            // Topic 3.2: Implicit Differentiation
            { topic: '3.2', type: 'multiple_choice', stem: 'If $x^2 + y^2 = 25$, find $\\frac{dy}{dx}$:', choices: ['$-\\frac{x}{y}$', '$\\frac{x}{y}$', '$-\\frac{y}{x}$', '$\\frac{y}{x}$'], correct: 0, explanation: '$2x + 2y\\frac{dy}{dx} = 0 \\Rightarrow \\frac{dy}{dx} = -\\frac{x}{y}$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $xy = 6$, find $\\frac{dy}{dx}$:', choices: ['$-\\frac{y}{x}$', '$\\frac{y}{x}$', '$-\\frac{x}{y}$', '$\\frac{6}{x^2}$'], correct: 0, explanation: '$y + x\\frac{dy}{dx} = 0 \\Rightarrow \\frac{dy}{dx} = -\\frac{y}{x}$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $x^2 + xy + y^2 = 7$, find $\\frac{dy}{dx}$:', choices: ['$\\frac{-2x-y}{x+2y}$', '$\\frac{2x+y}{x+2y}$', '$\\frac{-2x-y}{2y}$', '$\\frac{x+y}{x-y}$'], correct: 0, explanation: '$2x + y + x\\frac{dy}{dx} + 2y\\frac{dy}{dx} = 0$, solve for $\\frac{dy}{dx}$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $\\sin y = x$, find $\\frac{dy}{dx}$:', choices: ['$\\cos y$', '$\\frac{1}{\\cos y}$', '$-\\cos y$', '$\\frac{1}{\\sin x}$'], correct: 1, explanation: '$\\cos y \\cdot \\frac{dy}{dx} = 1 \\Rightarrow \\frac{dy}{dx} = \\frac{1}{\\cos y}$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $e^y = x$, find $\\frac{dy}{dx}$:', choices: ['$e^y$', '$\\frac{1}{e^y}$', '$\\frac{1}{x}$', 'Both B and C'], correct: 3, explanation: '$e^y \\frac{dy}{dx} = 1$, so $\\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $x^3 + y^3 = 6xy$, find $\\frac{dy}{dx}$ at $(3,3)$:', choices: ['$-1$', '$1$', '$0$', '$\\frac{1}{2}$'], correct: 0, explanation: '$3x^2 + 3y^2\\frac{dy}{dx} = 6y + 6x\\frac{dy}{dx}$; at $(3,3)$: $\\frac{dy}{dx} = -1$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $\\ln(xy) = x - y$, the derivative uses:', choices: ['Only product rule', 'Chain and product rules', 'Only chain rule', 'Implicit diff with chain/quotient'], correct: 3, explanation: '$\\ln(xy)$ needs chain rule; then solve implicitly for $\\frac{dy}{dx}$' },
            { topic: '3.2', type: 'multiple_choice', stem: 'If $y^2 = x$, then $\\frac{dy}{dx} =$', choices: ['$\\frac{1}{2y}$', '$2y$', '$\\frac{y}{2}$', '$\\frac{1}{2\\sqrt{x}}$'], correct: 0, explanation: '$2y\\frac{dy}{dx} = 1 \\Rightarrow \\frac{dy}{dx} = \\frac{1}{2y}$' },

            // Topic 3.3: Inverse Functions
            { topic: '3.3', type: 'multiple_choice', stem: 'If $f(x) = x^3$ and $g = f^{-1}$, then $g\'(8) =$', choices: ['$\\frac{1}{3}$', '$\\frac{1}{12}$', '$12$', '$\\frac{1}{24}$'], correct: 1, explanation: '$g(8) = 2$, $f\'(x) = 3x^2$, $g\'(8) = \\frac{1}{f\'(2)} = \\frac{1}{12}$' },
            { topic: '3.3', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\ln x) =$', choices: ['$\\frac{1}{x}$', '$\\ln x$', '$e^x$', '$x$'], correct: 0, explanation: 'Standard result: derivative of $\\ln x$ is $\\frac{1}{x}$' },
            { topic: '3.3', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\log_{10} x) =$', choices: ['$\\frac{1}{x}$', '$\\frac{1}{x \\ln 10}$', '$\\frac{\\ln 10}{x}$', '$10^x$'], correct: 1, explanation: '$\\frac{d}{dx}(\\log_a x) = \\frac{1}{x \\ln a}$' },
            { topic: '3.3', type: 'multiple_choice', stem: 'If $f(2) = 5$ and $f\'(2) = 3$, and $g = f^{-1}$, then $g\'(5) =$', choices: ['$3$', '$\\frac{1}{3}$', '$5$', '$\\frac{1}{5}$'], correct: 1, explanation: '$g\'(5) = \\frac{1}{f\'(g(5))} = \\frac{1}{f\'(2)} = \\frac{1}{3}$' },
            { topic: '3.3', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^x)$ equals $e^x$ because:', choices: ['$e$ is special', '$e^x$ is its own inverse', '$\\ln$ is inverse of $e^x$ with slope $\\frac{1}{x}$', 'Definition of $e$'], correct: 3, explanation: '$e$ is defined such that $\\frac{d}{dx}(e^x) = e^x$' },
            { topic: '3.3', type: 'multiple_choice', stem: 'If $f(x) = 2x + 1$, then $(f^{-1})\'(5) =$', choices: ['$2$', '$\\frac{1}{2}$', '$5$', '$\\frac{1}{5}$'], correct: 1, explanation: '$f\'(x) = 2$ everywhere, so $(f^{-1})\' = \\frac{1}{2}$' },
            { topic: '3.3', type: 'multiple_choice', stem: '$\\frac{d}{dx}(2^x) =$', choices: ['$2^x$', '$x \\cdot 2^{x-1}$', '$2^x \\ln 2$', '$\\frac{2^x}{\\ln 2}$'], correct: 2, explanation: '$\\frac{d}{dx}(a^x) = a^x \\ln a$' },
            { topic: '3.3', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\log_2(x)) =$', choices: ['$\\frac{1}{x}$', '$\\frac{1}{x \\ln 2}$', '$\\frac{\\ln 2}{x}$', '$2^x$'], correct: 1, explanation: '$\\frac{d}{dx}(\\log_a x) = \\frac{1}{x \\ln a}$' },

            // Topic 3.4: Inverse Trig Derivatives
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\arcsin x) =$', choices: ['$\\frac{1}{\\sqrt{1-x^2}}$', '$\\frac{-1}{\\sqrt{1-x^2}}$', '$\\frac{1}{1+x^2}$', '$\\sqrt{1-x^2}$'], correct: 0, explanation: 'Standard inverse trig derivative.' },
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\arctan x) =$', choices: ['$\\frac{1}{\\sqrt{1-x^2}}$', '$\\frac{-1}{1+x^2}$', '$\\frac{1}{1+x^2}$', '$\\sec^2 x$'], correct: 2, explanation: 'Derivative of arctangent is $\\frac{1}{1+x^2}$' },
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\arccos x) =$', choices: ['$\\frac{1}{\\sqrt{1-x^2}}$', '$\\frac{-1}{\\sqrt{1-x^2}}$', '$\\frac{1}{1+x^2}$', '$-\\cos x$'], correct: 1, explanation: 'Note the negative sign: $-\\frac{1}{\\sqrt{1-x^2}}$' },
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\arctan(3x)) =$', choices: ['$\\frac{1}{1+9x^2}$', '$\\frac{3}{1+9x^2}$', '$\\frac{3}{1+x^2}$', '$\\frac{1}{1+3x^2}$'], correct: 1, explanation: 'Chain rule: $\\frac{1}{1+(3x)^2} \\cdot 3 = \\frac{3}{1+9x^2}$' },
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\arcsin(2x)) =$', choices: ['$\\frac{1}{\\sqrt{1-4x^2}}$', '$\\frac{2}{\\sqrt{1-4x^2}}$', '$\\frac{2}{\\sqrt{1-x^2}}$', '$\\frac{1}{2\\sqrt{1-x^2}}$'], correct: 1, explanation: '$\\frac{1}{\\sqrt{1-4x^2}} \\cdot 2$' },
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x \\arctan x) =$', choices: ['$\\arctan x + \\frac{x}{1+x^2}$', '$\\frac{x}{1+x^2}$', '$\\arctan x$', '$\\frac{1}{1+x^2}$'], correct: 0, explanation: 'Product rule: $(1)(\\arctan x) + (x)(\\frac{1}{1+x^2})$' },
            { topic: '3.4', type: 'multiple_choice', stem: 'At $x = 0$, $\\frac{d}{dx}(\\arcsin x) =$', choices: ['$0$', '$1$', '$\\frac{1}{2}$', 'Undefined'], correct: 1, explanation: '$\\frac{1}{\\sqrt{1-0}} = 1$' },
            { topic: '3.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\arctan(e^x)) =$', choices: ['$\\frac{e^x}{1+e^{2x}}$', '$\\frac{1}{1+e^{2x}}$', '$\\frac{e^x}{1+e^x}$', '$e^x \\arctan(e^x)$'], correct: 0, explanation: '$\\frac{1}{1+(e^x)^2} \\cdot e^x = \\frac{e^x}{1+e^{2x}}$' },

            // Topic 3.5: Selecting Procedures
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(x^2 e^x)$ uses:', choices: ['Only power rule', 'Only chain rule', 'Product rule', 'Quotient rule'], correct: 2, explanation: 'Product of $x^2$ and $e^x$ requires product rule.' },
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\sin(\\ln x))$ uses:', choices: ['Product rule', 'Chain rule', 'Quotient rule', 'Implicit differentiation'], correct: 1, explanation: 'Composition of $\\sin$ and $\\ln x$ requires chain rule.' },
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{\\sin x}{x^2}\\right)$ uses:', choices: ['Product rule', 'Chain rule', 'Quotient rule', 'Power rule only'], correct: 2, explanation: 'Quotient of $\\sin x$ and $x^2$ requires quotient rule.' },
            { topic: '3.5', type: 'multiple_choice', stem: 'For $x^2 + y^2 = 4$, finding $\\frac{dy}{dx}$ uses:', choices: ['Product rule', 'Chain rule only', 'Implicit differentiation', 'Direct differentiation'], correct: 2, explanation: 'Equation not solved for $y$; use implicit differentiation.' },
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(e^{x^2} \\sin x)$ uses:', choices: ['Chain rule only', 'Product rule only', 'Product and chain rules', 'Quotient rule'], correct: 2, explanation: 'Product of two functions; one needs chain rule.' },
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(\\ln(\\sin x))$ uses:', choices: ['Product rule', 'Chain rule', 'Quotient rule', 'None needed'], correct: 1, explanation: 'Composition requires chain rule: $\\frac{\\cos x}{\\sin x} = \\cot x$' },
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}(5x^3 - 2x + 7)$ uses:', choices: ['Product rule', 'Chain rule', 'Basic rules (power, constant)', 'Quotient rule'], correct: 2, explanation: 'Simple polynomial: just power rule and constants.' },
            { topic: '3.5', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\left(\\frac{e^x}{\\cos x}\\right)$ uses:', choices: ['Product rule', 'Chain rule', 'Quotient rule', 'Both A and C'], correct: 2, explanation: 'Fraction requires quotient rule (no chain needed here).' },

            // Topic 3.6: Higher-Order Derivatives
            { topic: '3.6', type: 'multiple_choice', stem: 'If $f(x) = x^4$, then $f\'\'(x) =$', choices: ['$4x^3$', '$12x^2$', '$24x$', '$4x^2$'], correct: 1, explanation: '$f\'(x) = 4x^3$, $f\'\'(x) = 12x^2$' },
            { topic: '3.6', type: 'multiple_choice', stem: 'If $f(x) = \\sin x$, then $f\'\'(x) =$', choices: ['$\\sin x$', '$\\cos x$', '$-\\sin x$', '$-\\cos x$'], correct: 2, explanation: '$f\' = \\cos x$, $f\'\' = -\\sin x$' },
            { topic: '3.6', type: 'multiple_choice', stem: 'If $f(x) = e^x$, then $f^{(10)}(x) =$', choices: ['$10e^x$', '$e^{10x}$', '$e^x$', '$x^{10}e^x$'], correct: 2, explanation: 'All derivatives of $e^x$ equal $e^x$.' },
            { topic: '3.6', type: 'multiple_choice', stem: 'If $s(t) = t^3 - 6t$, acceleration $a(t) =$', choices: ['$3t^2 - 6$', '$6t$', '$6$', '$t^3 - 6$'], correct: 1, explanation: '$v = s\' = 3t^2 - 6$, $a = v\' = 6t$' },
            { topic: '3.6', type: 'multiple_choice', stem: 'The third derivative of $x^3 + x^2$ is:', choices: ['$6x + 2$', '$6$', '$6x$', '$3x^2 + 2x$'], correct: 1, explanation: '$f\' = 3x^2 + 2x$, $f\'\' = 6x + 2$, $f\'\'\' = 6$' },
            { topic: '3.6', type: 'multiple_choice', stem: '$\\frac{d^2}{dx^2}(\\ln x) =$', choices: ['$\\frac{1}{x}$', '$-\\frac{1}{x^2}$', '$\\frac{1}{x^2}$', '$\\ln x$'], correct: 1, explanation: 'First: $\\frac{1}{x}$, Second: $-\\frac{1}{x^2}$' },
            { topic: '3.6', type: 'multiple_choice', stem: 'If $f\'\'(x) > 0$, then $f$ is:', choices: ['Increasing', 'Decreasing', 'Concave up', 'Concave down'], correct: 2, explanation: 'Positive second derivative means concave up.' },
            { topic: '3.6', type: 'multiple_choice', stem: 'If $y = \\cos(2x)$, then $y\'\' =$', choices: ['$-2\\sin(2x)$', '$-4\\cos(2x)$', '$4\\cos(2x)$', '$-4\\sin(2x)$'], correct: 1, explanation: '$y\' = -2\\sin(2x)$, $y\'\' = -4\\cos(2x)$' },

            // ========== UNIT 4: CONTEXTUAL APPLICATIONS ==========
            // Topic 4.1: Interpreting Derivatives
            { topic: '4.1', type: 'multiple_choice', stem: 'If $T(t)$ is temperature (°F) at hour $t$, $T\'(5) = -3$ means:', choices: ['Temperature is -3°F', 'Temperature is decreasing 3°F/hr at $t=5$', 'Temperature will be -3°F at $t=5$', 'Rate is constant'], correct: 1, explanation: 'Derivative gives rate of change at that instant.' },
            { topic: '4.1', type: 'multiple_choice', stem: 'If $C(x)$ = cost in dollars for $x$ items, $C\'(100) = 15$ means:', choices: ['Cost is $15', '100th item costs $15', 'Next item costs about $15', 'Average cost is $15'], correct: 2, explanation: 'Marginal cost: approximate cost of producing one more unit.' },
            { topic: '4.1', type: 'multiple_choice', stem: '$P(t)$ = population, $P\'(t) > 0$ means:', choices: ['Population is positive', 'Population is increasing', 'Population is large', 'Population peaked'], correct: 1, explanation: 'Positive derivative means quantity is increasing.' },
            { topic: '4.1', type: 'multiple_choice', stem: 'If $f$ has units meters and $x$ has units seconds, $f\'$ has units:', choices: ['Meters', 'Seconds', 'm/s', 'm·s'], correct: 2, explanation: 'Derivative units = (output units)/(input units).' },
            { topic: '4.1', type: 'multiple_choice', stem: '$V(t)$ = volume of water (gal) at time $t$ (min). $V\'(10) = -5$ means:', choices: ['5 gallons at $t=10$', 'Losing 5 gal/min at $t=10$', 'Gaining 5 gal/min', 'Volume is negative'], correct: 1, explanation: 'Negative rate means decreasing; water is draining.' },
            { topic: '4.1', type: 'multiple_choice', stem: 'If $f\'(a) = 0$, then at $x = a$:', choices: ['$f(a) = 0$', 'Rate of change is zero', '$f$ is undefined', '$f$ has maximum'], correct: 1, explanation: 'Zero derivative means no instantaneous change.' },
            { topic: '4.1', type: 'multiple_choice', stem: '$R(p)$ = revenue at price $p$. $R\'(20) = 50$ means:', choices: ['Revenue is $50', 'At $p=20$, raising price $1 increases revenue ~$50', 'Price should be $50', 'Profit is $50'], correct: 1, explanation: 'Derivative gives rate of change per unit price increase.' },
            { topic: '4.1', type: 'multiple_choice', stem: 'If $|f\'(a)| > |f\'(b)|$, then at $x = a$:', choices: ['$f$ is larger', '$f$ is changing faster', '$f$ is positive', '$f$ has maximum'], correct: 1, explanation: 'Larger magnitude of derivative means faster rate of change.' },

            // Topic 4.2: Straight-Line Motion
            { topic: '4.2', type: 'multiple_choice', stem: 'If $s(t) = t^2 - 4t$, velocity at $t = 3$ is:', choices: ['$3$', '$2$', '$-3$', '$6$'], correct: 1, explanation: '$v(t) = 2t - 4$, $v(3) = 2$' },
            { topic: '4.2', type: 'multiple_choice', stem: 'Object at rest when:', choices: ['$s(t) = 0$', '$v(t) = 0$', '$a(t) = 0$', '$s\'\'(t) = 0$'], correct: 1, explanation: 'At rest means velocity equals zero.' },
            { topic: '4.2', type: 'multiple_choice', stem: 'If $v(t) < 0$ and $a(t) < 0$, the object is:', choices: ['Speeding up left', 'Slowing down left', 'Speeding up right', 'Slowing down right'], correct: 0, explanation: 'Same sign velocity and acceleration: speeding up.' },
            { topic: '4.2', type: 'multiple_choice', stem: 'Speed is defined as:', choices: ['$v(t)$', '$|v(t)|$', '$a(t)$', '$s(t)$'], correct: 1, explanation: 'Speed = |velocity|, always non-negative.' },
            { topic: '4.2', type: 'multiple_choice', stem: 'If $s(t) = \\sin t$, then $a(t) =$', choices: ['$\\cos t$', '$-\\sin t$', '$\\sin t$', '$-\\cos t$'], correct: 1, explanation: '$v = \\cos t$, $a = -\\sin t$' },
            { topic: '4.2', type: 'multiple_choice', stem: 'Particle changes direction when:', choices: ['$v$ changes sign', '$a = 0$', '$s = 0$', '$v$ is maximum'], correct: 0, explanation: 'Direction change occurs when velocity changes sign.' },
            { topic: '4.2', type: 'multiple_choice', stem: 'If $v(2) = 5$ and $a(2) = -3$, at $t = 2$ the object is:', choices: ['Speeding up', 'Slowing down', 'At rest', 'Cannot determine'], correct: 1, explanation: 'Opposite signs: slowing down.' },
            { topic: '4.2', type: 'multiple_choice', stem: 'For $s(t) = t^3 - 3t^2$, $v(t) = 0$ when $t =$', choices: ['$0$ only', '$2$ only', '$0$ and $2$', '$1$'], correct: 2, explanation: '$v = 3t^2 - 6t = 3t(t-2) = 0$ at $t = 0, 2$' },

            // Topic 4.3: Rates of Change in Context
            { topic: '4.3', type: 'multiple_choice', stem: 'Oil leaks at $L(t) = 100e^{-0.1t}$ gal/hr. At $t = 0$, leak rate is:', choices: ['$10$ gal/hr', '$100$ gal/hr', '$90$ gal/hr', '$0$ gal/hr'], correct: 1, explanation: '$L(0) = 100e^0 = 100$ gal/hr' },
            { topic: '4.3', type: 'multiple_choice', stem: 'If rate of change is constant, the original function is:', choices: ['Constant', 'Linear', 'Quadratic', 'Exponential'], correct: 1, explanation: 'Constant derivative means linear function.' },
            { topic: '4.3', type: 'multiple_choice', stem: 'Bacteria population $P(t) = 1000e^{0.5t}$. Growth rate at $t = 2$:', choices: ['$500e$', '$1000e$', '$500e^1$', '$500e^2$'], correct: 0, explanation: '$P\'(t) = 500e^{0.5t}$, $P\'(2) = 500e$' },
            { topic: '4.3', type: 'multiple_choice', stem: 'If $f\'(t)$ is decreasing but positive, $f$ is:', choices: ['Increasing faster', 'Increasing slower', 'Decreasing', 'Constant'], correct: 1, explanation: 'Positive derivative: increasing. Decreasing derivative: rate slowing.' },
            { topic: '4.3', type: 'multiple_choice', stem: 'Water drains: $V(t) = 100 - 5t - t^2$ gal. When is drain rate fastest?', choices: ['$t = 0$', '$t = 5$', 'Rate increases over time', 'Rate is constant'], correct: 2, explanation: '$V\'(t) = -5 - 2t$, magnitude increases as $t$ increases.' },
            { topic: '4.3', type: 'multiple_choice', stem: '$f\'(x) = 0$ for all $x$ means:', choices: ['$f$ is zero', '$f$ is constant', '$f$ is undefined', '$f$ has no maximum'], correct: 1, explanation: 'Zero derivative everywhere means no change: constant function.' },
            { topic: '4.3', type: 'multiple_choice', stem: 'Ice melts: $M(t) = 50 - 2t^2$ grams. Rate of melting at $t = 3$:', choices: ['$-12$ g/min', '$32$ g/min', '$12$ g/min', '$-6$ g/min'], correct: 0, explanation: '$M\'(t) = -4t$, $M\'(3) = -12$' },
            { topic: '4.3', type: 'multiple_choice', stem: 'If $f\'(a) > f\'(b)$, then near $x = a$:', choices: ['$f$ is larger', '$f$ is increasing faster', '$f$ has maximum', '$f$ is positive'], correct: 1, explanation: 'Larger derivative means faster rate of increase.' },

            // Topic 4.4: Introduction to Related Rates
            { topic: '4.4', type: 'multiple_choice', stem: 'In related rates, all variables are functions of:', choices: ['$x$', '$y$', '$t$ (time)', 'Each other'], correct: 2, explanation: 'Variables change with time; we relate their time derivatives.' },
            { topic: '4.4', type: 'multiple_choice', stem: 'If $A = \\pi r^2$, then $\\frac{dA}{dt} =$', choices: ['$2\\pi r$', '$\\pi r^2 \\frac{dr}{dt}$', '$2\\pi r \\frac{dr}{dt}$', '$\\pi \\frac{dr}{dt}$'], correct: 2, explanation: 'Chain rule: $\\frac{dA}{dt} = 2\\pi r \\frac{dr}{dt}$' },
            { topic: '4.4', type: 'multiple_choice', stem: 'If $x^2 + y^2 = 25$ and $\\frac{dx}{dt} = 3$ when $x = 3, y = 4$, find $\\frac{dy}{dt}$:', choices: ['$-\\frac{9}{4}$', '$\\frac{9}{4}$', '$-\\frac{4}{3}$', '$\\frac{3}{4}$'], correct: 0, explanation: '$2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$; solve for $\\frac{dy}{dt}$' },
            { topic: '4.4', type: 'multiple_choice', stem: 'First step in related rates:', choices: ['Differentiate', 'Draw diagram and identify variables', 'Substitute values', 'Find $\\frac{dx}{dt}$'], correct: 1, explanation: 'Start with a diagram to understand the relationships.' },
            { topic: '4.4', type: 'multiple_choice', stem: 'When differentiating $V = \\frac{4}{3}\\pi r^3$ with respect to $t$:', choices: ['$V\' = 4\\pi r^2$', '$\\frac{dV}{dt} = 4\\pi r^2$', '$\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$', '$\\frac{dV}{dr} = 4\\pi r^2$'], correct: 2, explanation: 'Must include $\\frac{dr}{dt}$ by chain rule.' },
            { topic: '4.4', type: 'multiple_choice', stem: 'For $xy = 12$, $\\frac{d(xy)}{dt} =$', choices: ['$xy\'$', '$x\'y$', '$x\'y + xy\'$', '$x\'y\'$'], correct: 2, explanation: 'Product rule: $\\frac{dx}{dt} \\cdot y + x \\cdot \\frac{dy}{dt}$' },
            { topic: '4.4', type: 'multiple_choice', stem: 'In related rates, "constant" means:', choices: ['Its derivative is 0', 'It equals 0', 'It\'s unknown', 'It\'s the answer'], correct: 0, explanation: 'Constants don\'t change, so their time derivative is 0.' },
            { topic: '4.4', type: 'multiple_choice', stem: 'If $\\sin\\theta = \\frac{y}{10}$, then $\\cos\\theta \\frac{d\\theta}{dt} =$', choices: ['$\\frac{1}{10}$', '$\\frac{1}{10}\\frac{dy}{dt}$', '$\\frac{dy}{dt}$', '$10\\frac{dy}{dt}$'], correct: 1, explanation: 'Differentiate both sides with respect to $t$.' },

            // Topic 4.5: Solving Related Rates
            { topic: '4.5', type: 'multiple_choice', stem: 'Radius increases at 2 cm/s. When $r = 5$, $\\frac{dA}{dt}$ for circle:', choices: ['$20\\pi$', '$10\\pi$', '$4\\pi$', '$25\\pi$'], correct: 0, explanation: '$\\frac{dA}{dt} = 2\\pi r \\frac{dr}{dt} = 2\\pi(5)(2) = 20\\pi$' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Ladder 10 ft, base slides at 1 ft/s. When base is 6 ft out, top slides:', choices: ['$0.75$ ft/s down', '$1$ ft/s down', '$1.25$ ft/s down', '$0.5$ ft/s down'], correct: 0, explanation: 'When $x=6$, $y=8$; $\\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt} = -0.75$' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Cone: $V = \\frac{1}{3}\\pi r^2 h$ with $r = \\frac{h}{2}$. Express $V$ in terms of $h$:', choices: ['$\\frac{\\pi h^3}{12}$', '$\\frac{\\pi h^3}{3}$', '$\\frac{\\pi h^2}{6}$', '$\\frac{\\pi h^3}{4}$'], correct: 0, explanation: '$V = \\frac{1}{3}\\pi(\\frac{h}{2})^2 h = \\frac{\\pi h^3}{12}$' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Shadow problem: when to substitute known values?', choices: ['Before differentiating', 'After differentiating', 'Either time', 'Never substitute'], correct: 1, explanation: 'Substitute AFTER differentiating to avoid losing variables.' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Sphere volume increases at 8 cm³/s. When $r = 2$, $\\frac{dr}{dt} =$', choices: ['$\\frac{1}{2\\pi}$', '$\\frac{2}{\\pi}$', '$\\frac{1}{\\pi}$', '$2\\pi$'], correct: 0, explanation: '$\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$; solve for $\\frac{dr}{dt}$' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Two cars: one goes N at 60 mph, other E at 80 mph. Rate of distance change:', choices: ['$70$ mph', '$100$ mph', '$140$ mph', '$20$ mph'], correct: 1, explanation: 'Pythagorean: $\\frac{dD}{dt} = \\frac{x(dx/dt) + y(dy/dt)}{D}$' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Balloon rises at 3 m/s. 100 m away, angle of elevation changes when balloon at 100 m:', choices: ['$0.015$ rad/s', '$0.03$ rad/s', '$0.01$ rad/s', '$0.02$ rad/s'], correct: 0, explanation: '$\\tan\\theta = h/100$; differentiate and evaluate.' },
            { topic: '4.5', type: 'multiple_choice', stem: 'Water fills cone-shaped tank. If depth increases at constant rate, fill rate:', choices: ['Constant', 'Increases', 'Decreases', 'Cannot determine'], correct: 1, explanation: 'Wider at top means more volume per unit depth increase.' },

            // Topic 4.6: Local Linear Approximation
            { topic: '4.6', type: 'multiple_choice', stem: 'Linear approximation of $f$ at $a$:', choices: ['$f(a)$', '$f\'(a)(x-a)$', '$f(a) + f\'(a)(x-a)$', '$f(a) + f\'(a)$'], correct: 2, explanation: 'Tangent line: $L(x) = f(a) + f\'(a)(x-a)$' },
            { topic: '4.6', type: 'multiple_choice', stem: 'Estimate $\\sqrt{9.1}$ using $f(x) = \\sqrt{x}$ at $a = 9$:', choices: ['$3.017$', '$3.05$', '$3.1$', '$3.005$'], correct: 0, explanation: '$f(9) = 3$, $f\'(9) = \\frac{1}{6}$; $3 + \\frac{0.1}{6} \\approx 3.017$' },
            { topic: '4.6', type: 'multiple_choice', stem: 'If $dy = f\'(x)dx$, then $dy$ approximates:', choices: ['$f(x)$', '$\\Delta y$', '$\\Delta x$', '$f\'(x)$'], correct: 1, explanation: 'Differential $dy$ approximates actual change $\\Delta y$.' },
            { topic: '4.6', type: 'multiple_choice', stem: 'For $f(x) = x^3$ at $a = 2$, estimate $f(2.1)$:', choices: ['$8.12$', '$9.261$', '$9.2$', '$9.0$'], correct: 2, explanation: '$f(2) = 8$, $f\'(2) = 12$; $8 + 12(0.1) = 9.2$' },
            { topic: '4.6', type: 'multiple_choice', stem: 'Linear approximation works best when:', choices: ['$x$ is large', '$x$ is near $a$', '$f\'(a) = 0$', '$f$ is linear'], correct: 1, explanation: 'Tangent line best approximates curve near point of tangency.' },
            { topic: '4.6', type: 'multiple_choice', stem: 'If $f\'(a) > 0$ and $x > a$, linear approximation gives:', choices: ['Exact value', 'Overestimate if concave down', 'Always underestimate', 'Cannot determine'], correct: 1, explanation: 'Tangent lies above concave down curve.' },
            { topic: '4.6', type: 'multiple_choice', stem: 'Estimate $e^{0.1}$ using $f(x) = e^x$ at $a = 0$:', choices: ['$1.0$', '$1.1$', '$1.01$', '$1.105$'], correct: 1, explanation: '$f(0) = 1$, $f\'(0) = 1$; $1 + 1(0.1) = 1.1$' },
            { topic: '4.6', type: 'multiple_choice', stem: 'The error in linear approximation is approximately:', choices: ['$|f\'\'(a)|$', '$\\frac{1}{2}f\'\'(a)(x-a)^2$', '$f\'(a)(x-a)$', 'Zero'], correct: 1, explanation: 'Second-order term from Taylor series gives error estimate.' },

            // Topic 4.7: L\'Hospital\'s Rule
            { topic: '4.7', type: 'multiple_choice', stem: 'L\'Hospital\'s Rule applies to:', choices: ['$\\frac{1}{0}$', '$\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$', 'Any limit', '$\\frac{\\infty}{0}$'], correct: 1, explanation: 'Only use for indeterminate forms $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$.' },
            { topic: '4.7', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{e^x - 1}{x}$ by L\'Hospital:', choices: ['$0$', '$1$', '$e$', 'DNE'], correct: 1, explanation: '$\\frac{0}{0}$ form; $\\lim \\frac{e^x}{1} = 1$' },
            { topic: '4.7', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{x^2}{e^x}$ by L\'Hospital:', choices: ['$\\infty$', '$0$', '$1$', '$2$'], correct: 1, explanation: 'Apply twice: $\\frac{2x}{e^x} \\to \\frac{2}{e^x} \\to 0$' },
            { topic: '4.7', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{\\sin x}{x}$ by L\'Hospital:', choices: ['$0$', '$1$', '$\\infty$', 'DNE'], correct: 1, explanation: '$\\frac{0}{0}$; $\\lim \\frac{\\cos x}{1} = 1$' },
            { topic: '4.7', type: 'multiple_choice', stem: 'For $\\lim_{x \\to 0^+} x \\ln x$, first rewrite as:', choices: ['$\\frac{\\ln x}{1/x}$', '$\\frac{x}{1/\\ln x}$', '$e^{x \\ln x}$', 'Can\'t use L\'Hospital'], correct: 0, explanation: 'Convert to $\\frac{\\ln x}{1/x}$ giving $\\frac{-\\infty}{\\infty}$.' },
            { topic: '4.7', type: 'multiple_choice', stem: '$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$ by L\'Hospital:', choices: ['$0$', '$\\frac{1}{2}$', '$1$', '$2$'], correct: 1, explanation: 'Apply twice: $\\frac{\\sin x}{2x} \\to \\frac{\\cos x}{2} = \\frac{1}{2}$' },
            { topic: '4.7', type: 'multiple_choice', stem: 'If L\'Hospital gives $\\frac{0}{0}$ again:', choices: ['Stop', 'Apply L\'Hospital again', 'Limit DNE', 'Use different method'], correct: 1, explanation: 'Can apply repeatedly until form is determinate.' },
            { topic: '4.7', type: 'multiple_choice', stem: '$\\lim_{x \\to \\infty} \\frac{\\ln x}{\\sqrt{x}}$:', choices: ['$\\infty$', '$0$', '$1$', '$\\frac{1}{2}$'], correct: 1, explanation: '$\\frac{1/x}{1/(2\\sqrt{x})} = \\frac{2\\sqrt{x}}{x} = \\frac{2}{\\sqrt{x}} \\to 0$' },

            // ========== UNIT 5: ANALYTICAL APPLICATIONS ==========
            // Topic 5.1: Mean Value Theorem
            { topic: '5.1', type: 'multiple_choice', stem: 'MVT guarantees for $f$ on $[a,b]$:', choices: ['$f$ has a max', '$f\'(c) = 0$ somewhere', '$f\'(c) =$ average rate somewhere', '$f$ is constant'], correct: 2, explanation: 'MVT: instantaneous rate equals average rate at some point.' },
            { topic: '5.1', type: 'multiple_choice', stem: 'For $f(x) = x^2$ on $[0, 4]$, find $c$ from MVT:', choices: ['$1$', '$2$', '$3$', '$4$'], correct: 1, explanation: 'Average rate $= 4$; $f\'(c) = 2c = 4 \\Rightarrow c = 2$' },
            { topic: '5.1', type: 'multiple_choice', stem: 'MVT requires $f$ to be:', choices: ['Continuous on $[a,b]$, differentiable on $(a,b)$', 'Differentiable everywhere', 'Continuous everywhere', 'Linear'], correct: 0, explanation: 'Continuous on closed, differentiable on open interval.' },
            { topic: '5.1', type: 'multiple_choice', stem: 'If $f(0) = 2$ and $f\'(x) \\leq 3$ for all $x$, then $f(4) \\leq$:', choices: ['$6$', '$12$', '$14$', '$8$'], correct: 2, explanation: 'By MVT, max rate is 3, so $f(4) \\leq 2 + 3(4) = 14$' },
            { topic: '5.1', type: 'multiple_choice', stem: 'MVT is a special case of:', choices: ['IVT', 'EVT', 'Rolle\'s Theorem generalized', 'FTC'], correct: 2, explanation: 'Rolle\'s requires $f(a) = f(b)$; MVT generalizes this.' },
            { topic: '5.1', type: 'multiple_choice', stem: 'For $f(x) = |x|$ on $[-1, 1]$, MVT:', choices: ['Applies', 'Doesn\'t apply (not continuous)', 'Doesn\'t apply (not differentiable at 0)', 'Gives $c = 0$'], correct: 2, explanation: '$|x|$ not differentiable at $x = 0$.' },
            { topic: '5.1', type: 'multiple_choice', stem: 'If $f\'(x) = 0$ for all $x$ in $(a,b)$, then $f$ is:', choices: ['Zero', 'Constant', 'Linear', 'Undefined'], correct: 1, explanation: 'Zero derivative everywhere means no change: constant.' },
            { topic: '5.1', type: 'multiple_choice', stem: 'MVT guarantees existence of $c$ but doesn\'t:', choices: ['Say $c$ exists', 'Give unique $c$', 'Relate to $f\'$', 'Apply to polynomials'], correct: 1, explanation: 'There may be multiple values of $c$ that work.' },

            // Topic 5.2: EVT and Critical Points
            { topic: '5.2', type: 'multiple_choice', stem: 'Critical point occurs when:', choices: ['$f(c) = 0$', '$f\'(c) = 0$ or $f\'(c)$ undefined', '$f\'\'(c) = 0$', '$f$ is continuous'], correct: 1, explanation: 'Critical: derivative zero or undefined.' },
            { topic: '5.2', type: 'multiple_choice', stem: 'EVT requires:', choices: ['$f$ differentiable on $[a,b]$', '$f$ continuous on $[a,b]$', '$f\'$ exists everywhere', '$f(a) = f(b)$'], correct: 1, explanation: 'Continuity on closed interval guarantees extrema.' },
            { topic: '5.2', type: 'multiple_choice', stem: 'Critical points of $f(x) = x^3 - 3x$:', choices: ['$x = 0$', '$x = 1$ only', '$x = \\pm 1$', 'None'], correct: 2, explanation: '$f\'(x) = 3x^2 - 3 = 0$ at $x = \\pm 1$' },
            { topic: '5.2', type: 'multiple_choice', stem: 'For $f(x) = |x-2|$, critical point is at:', choices: ['$x = 0$', '$x = 2$', 'No critical points', '$x = -2$'], correct: 1, explanation: 'Derivative undefined at $x = 2$ (corner).' },
            { topic: '5.2', type: 'multiple_choice', stem: 'Absolute extrema on $[a,b]$ occur at:', choices: ['Only critical points', 'Only endpoints', 'Critical points or endpoints', 'Inflection points'], correct: 2, explanation: 'Check both critical points and endpoints.' },
            { topic: '5.2', type: 'multiple_choice', stem: '$f(x) = x^4$ on $[-1, 2]$: absolute max at:', choices: ['$x = -1$', '$x = 0$', '$x = 2$', '$x = 1$'], correct: 2, explanation: '$f(-1) = 1$, $f(0) = 0$, $f(2) = 16$; max at $x = 2$' },
            { topic: '5.2', type: 'multiple_choice', stem: 'True or False: Every critical point is a local extremum.', choices: ['True', 'False'], correct: 1, explanation: 'False. $x^3$ has critical point at 0 but no extremum.' },
            { topic: '5.2', type: 'multiple_choice', stem: 'For $f(x) = \\frac{1}{x}$ on $(0, \\infty)$:', choices: ['Has absolute max', 'Has absolute min', 'No critical points in domain', 'Both B and C'], correct: 3, explanation: '$f\'(x) = -1/x^2 \\neq 0$; no critical points, no extrema.' },

            // Topic 5.3: Increasing/Decreasing
            { topic: '5.3', type: 'multiple_choice', stem: '$f\'(x) > 0$ means $f$ is:', choices: ['Positive', 'Increasing', 'Concave up', 'Has maximum'], correct: 1, explanation: 'Positive derivative means function is increasing.' },
            { topic: '5.3', type: 'multiple_choice', stem: '$f(x) = x^3 - 3x$ is increasing on:', choices: ['$(-1, 1)$', '$(-\\infty, -1) \\cup (1, \\infty)$', 'All reals', '$(-\\infty, 0)$'], correct: 1, explanation: '$f\' = 3x^2 - 3 > 0$ when $|x| > 1$' },
            { topic: '5.3', type: 'multiple_choice', stem: 'If $f\'(x) < 0$ on $(a,b)$, then $f$ is:', choices: ['Negative on $(a,b)$', 'Decreasing on $(a,b)$', 'Has min at $a$', 'Concave down'], correct: 1, explanation: 'Negative derivative means decreasing.' },
            { topic: '5.3', type: 'multiple_choice', stem: '$f(x) = e^{-x}$ is:', choices: ['Always increasing', 'Always decreasing', 'Increasing then decreasing', 'Neither'], correct: 1, explanation: '$f\'(x) = -e^{-x} < 0$ always.' },
            { topic: '5.3', type: 'multiple_choice', stem: 'To find where $f$ is decreasing, solve:', choices: ['$f(x) < 0$', '$f\'(x) < 0$', '$f\'\'(x) < 0$', '$f\'(x) = 0$'], correct: 1, explanation: 'Find where first derivative is negative.' },
            { topic: '5.3', type: 'multiple_choice', stem: '$f(x) = \\sin x$ is increasing on:', choices: ['$(0, \\pi)$', '$(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$', '$(\\frac{\\pi}{2}, \\frac{3\\pi}{2})$', '$(0, 2\\pi)$'], correct: 1, explanation: '$f\' = \\cos x > 0$ on $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$' },
            { topic: '5.3', type: 'multiple_choice', stem: 'If $f\'(c) = 0$ and $f\'$ changes from $+$ to $-$:', choices: ['Local min at $c$', 'Local max at $c$', 'Inflection at $c$', 'No conclusion'], correct: 1, explanation: 'Increasing then decreasing means local max.' },
            { topic: '5.3', type: 'multiple_choice', stem: '$f(x) = x^4 - 4x^2$ decreases on:', choices: ['$(-\\sqrt{2}, 0) \\cup (\\sqrt{2}, \\infty)$', '$(-\\infty, -\\sqrt{2}) \\cup (0, \\sqrt{2})$', '$(0, 2)$', '$(-2, 0)$'], correct: 1, explanation: '$f\' = 4x(x^2-2)$; analyze sign.' },

            // Topic 5.4: First Derivative Test
            { topic: '5.4', type: 'multiple_choice', stem: 'First Derivative Test: $f\'$ changes $-$ to $+$ means:', choices: ['Local max', 'Local min', 'Inflection', 'No extremum'], correct: 1, explanation: 'Decreasing to increasing = local minimum.' },
            { topic: '5.4', type: 'multiple_choice', stem: 'At $x = 2$: $f\'(1.9) = 3$, $f\'(2.1) = -1$. At $x = 2$:', choices: ['Local min', 'Local max', 'Neither', 'Inflection'], correct: 1, explanation: 'Sign change $+$ to $-$ means local max.' },
            { topic: '5.4', type: 'multiple_choice', stem: 'For $f(x) = x^3$, at $x = 0$:', choices: ['Local max', 'Local min', 'Neither (inflection)', 'Cannot determine'], correct: 2, explanation: '$f\' = 3x^2 \\geq 0$ always; no sign change.' },
            { topic: '5.4', type: 'multiple_choice', stem: '$f\'(x) = (x-1)^2(x-3)$. Local max at:', choices: ['$x = 1$', '$x = 3$', '$x = 1$ and $x = 3$', 'Neither'], correct: 3, explanation: 'At $x=1$: no sign change. At $x=3$: $-$ to $+$ = min.' },
            { topic: '5.4', type: 'multiple_choice', stem: '$f\'(x) = x(x-2)^2$. Classify critical points:', choices: ['Min at 0, max at 2', 'Max at 0, min at 2', 'Min at 0, neither at 2', 'Max at 0, neither at 2'], correct: 2, explanation: 'At 0: $-$ to $+$ = min. At 2: no sign change.' },
            { topic: '5.4', type: 'multiple_choice', stem: 'FDT fails when:', choices: ['$f\'$ doesn\'t change sign', '$f\'(c) = 0$', '$f$ is continuous', '$c$ is critical'], correct: 0, explanation: 'No sign change means test gives no conclusion.' },
            { topic: '5.4', type: 'multiple_choice', stem: '$f\'(x) = e^x(x-1)$. Local min at:', choices: ['$x = 0$', '$x = 1$', '$x = -1$', 'No local min'], correct: 1, explanation: '$f\'(x) < 0$ for $x < 1$, $f\'(x) > 0$ for $x > 1$.' },
            { topic: '5.4', type: 'multiple_choice', stem: 'For FDT, we need $f\'$ near $c$, not:', choices: ['$f(c)$', '$f\'(c)$ exactly', '$f\'\'(c)$', 'Sign of $f\'$ on both sides'], correct: 2, explanation: 'FDT uses sign of $f\'$, not $f\'\'$.' },

            // Topic 5.5: Candidates Test
            { topic: '5.5', type: 'multiple_choice', stem: 'Candidates Test is for finding:', choices: ['Local extrema', 'Inflection points', 'Absolute extrema on closed interval', 'Concavity'], correct: 2, explanation: 'Compares function values at all candidates.' },
            { topic: '5.5', type: 'multiple_choice', stem: '$f(x) = x^3 - 3x$ on $[0, 2]$. Candidates are:', choices: ['$0, 1, 2$', '$-1, 0, 1, 2$', '$1$', '$0, 2$'], correct: 0, explanation: 'Critical point $x=1$ in $[0,2]$, plus endpoints 0 and 2.' },
            { topic: '5.5', type: 'multiple_choice', stem: '$f(x) = x^2$ on $[-3, 2]$. Absolute max:', choices: ['At $x = 0$', 'At $x = 2$', 'At $x = -3$', 'At $x = \\pm 3$'], correct: 2, explanation: '$f(-3) = 9$, $f(0) = 0$, $f(2) = 4$. Max at $x = -3$.' },
            { topic: '5.5', type: 'multiple_choice', stem: 'For absolute extrema, evaluate $f$ at:', choices: ['All critical points only', 'Endpoints only', 'Critical points and endpoints', 'Where $f\'\' = 0$'], correct: 2, explanation: 'Both critical points in interval AND endpoints.' },
            { topic: '5.5', type: 'multiple_choice', stem: '$f(x) = \\sin x$ on $[0, 2\\pi]$. Absolute min value:', choices: ['$0$', '$-1$', '$1$', '$\\frac{\\pi}{2}$'], correct: 1, explanation: 'Min at $x = \\frac{3\\pi}{2}$ where $\\sin = -1$.' },
            { topic: '5.5', type: 'multiple_choice', stem: 'If no critical points in $(a,b)$, absolute extrema occur:', choices: ['Nowhere', 'Only at endpoints', 'At midpoint', 'Cannot determine'], correct: 1, explanation: 'Must be at endpoints if no critical points inside.' },
            { topic: '5.5', type: 'multiple_choice', stem: '$f(x) = e^{-x}$ on $[0, 3]$. Absolute max at:', choices: ['$x = 0$', '$x = 3$', '$x = 1$', 'No maximum'], correct: 0, explanation: '$e^{-x}$ is decreasing; max at left endpoint.' },
            { topic: '5.5', type: 'multiple_choice', stem: 'Why doesn\'t Candidates Test work on open intervals?', choices: ['No endpoints to check', 'Critical points don\'t exist', '$f$ isn\'t continuous', 'EVT doesn\'t apply'], correct: 0, explanation: 'Open intervals have no endpoints; extrema may not exist.' },

            // Topic 5.6: Concavity
            { topic: '5.6', type: 'multiple_choice', stem: '$f\'\'(x) > 0$ means:', choices: ['$f$ increasing', '$f$ concave up', '$f$ has max', '$f\' = 0$'], correct: 1, explanation: 'Positive second derivative = concave up.' },
            { topic: '5.6', type: 'multiple_choice', stem: '$f(x) = x^3$ is concave up on:', choices: ['$(-\\infty, 0)$', '$(0, \\infty)$', 'All reals', 'Nowhere'], correct: 1, explanation: '$f\'\' = 6x > 0$ when $x > 0$.' },
            { topic: '5.6', type: 'multiple_choice', stem: 'Inflection point is where:', choices: ['$f\' = 0$', '$f = 0$', 'Concavity changes', '$f\'\'$ has max'], correct: 2, explanation: 'Inflection: concavity changes (usually $f\'\' = 0$).' },
            { topic: '5.6', type: 'multiple_choice', stem: '$f(x) = x^4$ at $x = 0$:', choices: ['Inflection', 'Local max', 'Local min', 'Neither max nor inflection'], correct: 2, explanation: '$f\'\' = 12x^2 > 0$ for $x \\neq 0$; no inflection, min at 0.' },
            { topic: '5.6', type: 'multiple_choice', stem: '$f(x) = \\sin x$. Inflection points:', choices: ['$x = 0, \\pi, 2\\pi, ...$', '$x = \\frac{\\pi}{2}, \\frac{3\\pi}{2}, ...$', 'None', '$x = \\frac{\\pi}{4}$'], correct: 0, explanation: '$f\'\' = -\\sin x = 0$ at multiples of $\\pi$.' },
            { topic: '5.6', type: 'multiple_choice', stem: '$f\'\'(x) = x(x-2)$. Concave down on:', choices: ['$(-\\infty, 0)$', '$(0, 2)$', '$(2, \\infty)$', '$(-\\infty, 0) \\cup (2, \\infty)$'], correct: 1, explanation: '$f\'\' < 0$ when $0 < x < 2$.' },
            { topic: '5.6', type: 'multiple_choice', stem: 'At inflection point, $f\'$ is:', choices: ['Zero', 'Maximum or minimum', 'Undefined', 'Positive'], correct: 1, explanation: '$f\'$ has extremum where $f\'\' = 0$ and changes sign.' },
            { topic: '5.6', type: 'multiple_choice', stem: 'Concave up means tangent lines lie:', choices: ['Above curve', 'Below curve', 'On curve', 'Cannot determine'], correct: 1, explanation: 'Concave up: curve bends above its tangents.' },

            // Topic 5.7: Second Derivative Test
            { topic: '5.7', type: 'multiple_choice', stem: 'SDT: $f\'(c) = 0$ and $f\'\'(c) < 0$ means:', choices: ['Local min', 'Local max', 'Inflection', 'Test fails'], correct: 1, explanation: 'Concave down at critical point = local max.' },
            { topic: '5.7', type: 'multiple_choice', stem: '$f(x) = x^4$, $f\'(0) = 0$, $f\'\'(0) = 0$. SDT says:', choices: ['Local max', 'Local min', 'Inconclusive', 'Inflection'], correct: 2, explanation: 'SDT inconclusive when $f\'\'(c) = 0$.' },
            { topic: '5.7', type: 'multiple_choice', stem: '$f(x) = x^2 - 4x$. At critical point:', choices: ['SDT gives max', 'SDT gives min', 'SDT inconclusive', 'No critical point'], correct: 1, explanation: '$f\' = 2x - 4 = 0$ at $x = 2$; $f\'\' = 2 > 0$: min.' },
            { topic: '5.7', type: 'multiple_choice', stem: 'When to use SDT vs FDT:', choices: ['SDT always better', 'FDT when $f\'\'(c) = 0$', 'FDT always better', 'They give different answers'], correct: 1, explanation: 'Use FDT when SDT is inconclusive.' },
            { topic: '5.7', type: 'multiple_choice', stem: '$f\'(x) = x^2 - 1$, $f\'\'(x) = 2x$. At $x = 1$:', choices: ['Local max', 'Local min', 'Inflection', 'SDT inconclusive'], correct: 1, explanation: '$f\'(1) = 0$, $f\'\'(1) = 2 > 0$: local min.' },
            { topic: '5.7', type: 'multiple_choice', stem: '$f(x) = -x^2 + 6x - 5$. At critical point:', choices: ['Maximum', 'Minimum', 'Neither', 'SDT fails'], correct: 0, explanation: '$f\' = -2x + 6 = 0$ at $x = 3$; $f\'\' = -2 < 0$: max.' },
            { topic: '5.7', type: 'multiple_choice', stem: 'SDT tests whether critical point is:', choices: ['Absolute extremum', 'Inflection point', 'Local extremum', 'In domain'], correct: 2, explanation: 'SDT classifies local (not absolute) extrema.' },
            { topic: '5.7', type: 'multiple_choice', stem: '$f\'\'(c) > 0$ at critical point means curve is:', choices: ['Decreasing', 'Bowl-shaped (min)', 'Hill-shaped (max)', 'Linear'], correct: 1, explanation: 'Concave up at stationary point = local min.' },

            // Topic 5.8: Curve Sketching
            { topic: '5.8', type: 'multiple_choice', stem: 'First step in curve sketching:', choices: ['Find $f\'\'$', 'Find domain and intercepts', 'Find asymptotes', 'Plot points'], correct: 1, explanation: 'Start with domain, then intercepts and basic features.' },
            { topic: '5.8', type: 'multiple_choice', stem: 'Horizontal asymptote found from:', choices: ['$f\'(x) = 0$', '$\\lim_{x \\to \\infty} f(x)$', 'Denominator = 0', '$f\'\'(x) = 0$'], correct: 1, explanation: 'HA is the limit as $x \\to \\pm\\infty$.' },
            { topic: '5.8', type: 'multiple_choice', stem: 'For $f(x) = \\frac{x}{x^2+1}$, horizontal asymptote is:', choices: ['$y = 1$', '$y = 0$', '$y = x$', 'None'], correct: 1, explanation: 'Degree of num < degree of denom: HA at $y = 0$.' },
            { topic: '5.8', type: 'multiple_choice', stem: 'Vertical asymptote of $f(x) = \\frac{1}{x-3}$ at:', choices: ['$x = 0$', '$x = 1$', '$x = 3$', '$y = 3$'], correct: 2, explanation: 'Denominator zero at $x = 3$.' },
            { topic: '5.8', type: 'multiple_choice', stem: '$f(x) = x^3$ has:', choices: ['No symmetry', 'Even symmetry', 'Odd symmetry', 'Periodic symmetry'], correct: 2, explanation: '$f(-x) = -f(x)$: odd function.' },
            { topic: '5.8', type: 'multiple_choice', stem: 'Local max on curve sketch shows:', choices: ['Highest point overall', 'Peak in neighborhood', 'Where $f\'\' = 0$', 'Endpoint'], correct: 1, explanation: 'Local max: highest nearby, not necessarily global.' },
            { topic: '5.8', type: 'multiple_choice', stem: 'At inflection point, curve:', choices: ['Has horizontal tangent', 'Changes direction', 'Changes from curving up to down', 'Crosses x-axis'], correct: 2, explanation: 'Inflection: concavity changes.' },
            { topic: '5.8', type: 'multiple_choice', stem: '$f(x) = x^4 - 2x^2$ is symmetric about:', choices: ['Origin', 'y-axis', 'Line $y = x$', 'Not symmetric'], correct: 1, explanation: 'Only even powers: $f(-x) = f(x)$, even function.' },

            // Topic 5.9: Connecting f, f\', f\'\'
            { topic: '5.9', type: 'multiple_choice', stem: 'If $f$ has local max, then $f\'$:', choices: ['Is positive', 'Is negative', 'Crosses zero (changes sign)', 'Is undefined'], correct: 2, explanation: 'Local max: $f\'$ changes from $+$ to $-$.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'If $f\'$ is increasing, then $f$ is:', choices: ['Increasing', 'Concave up', 'Decreasing', 'Concave down'], correct: 1, explanation: '$f\'$ increasing means $f\'\' > 0$: concave up.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'Graph of $f\'$ crosses x-axis where $f$ has:', choices: ['Inflection', 'Max or min', 'y-intercept', 'Asymptote'], correct: 1, explanation: '$f\' = 0$ at critical points of $f$.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'If $f\'\'$ changes from $+$ to $-$, then $f\'$:', choices: ['Has local max', 'Has local min', 'Is constant', 'Is zero'], correct: 0, explanation: '$f\'$ has max where $f\'\' = 0$ changes sign.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'Where $f\'$ has local max, $f$ has:', choices: ['Local max', 'Local min', 'Inflection point', 'Nothing special'], correct: 2, explanation: '$f\'$ max means $f\'\' = 0$ and changes sign: inflection.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'If $f$ is concave down and increasing:', choices: ['$f\' > 0$, $f\'\' > 0$', '$f\' > 0$, $f\'\' < 0$', '$f\' < 0$, $f\'\' < 0$', '$f\' < 0$, $f\'\' > 0$'], correct: 1, explanation: 'Increasing: $f\' > 0$. Concave down: $f\'\' < 0$.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'At $x = a$: $f\'(a) = 0$, $f\'\'(a) = 0$, $f\'\'$ changes sign. Then:', choices: ['$f$ has max at $a$', '$f$ has min at $a$', '$f$ has inflection at $a$', 'Need more info'], correct: 2, explanation: 'Horizontal tangent + concavity change = inflection.' },
            { topic: '5.9', type: 'multiple_choice', stem: 'If $f\'(x) > 0$ for all $x$, then $f$:', choices: ['Is always positive', 'Is always increasing', 'Has no critical points', 'Both B and C'], correct: 3, explanation: 'Positive derivative: always increasing, $f\' \\neq 0$.' },

            // Topic 5.10: Introduction to Optimization
            { topic: '5.10', type: 'multiple_choice', stem: 'Optimization finds:', choices: ['Zeros of $f$', 'Maximum or minimum values', 'Inflection points', 'Asymptotes'], correct: 1, explanation: 'Optimization maximizes or minimizes a quantity.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'First step in optimization:', choices: ['Take derivative', 'Identify what to optimize', 'Set $f\' = 0$', 'Draw graph'], correct: 1, explanation: 'First understand what quantity to maximize/minimize.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'Constraint equation is used to:', choices: ['Find maximum', 'Express one variable in terms of another', 'Set derivative to zero', 'Check concavity'], correct: 1, explanation: 'Constraint reduces problem to one variable.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'Max area rectangle with perimeter 20:', choices: ['Square with side 5', 'Rectangle $6 \\times 4$', 'Rectangle $7 \\times 3$', 'Rectangle $8 \\times 2$'], correct: 0, explanation: 'Square maximizes area for fixed perimeter.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'After finding critical point, verify it\'s a maximum by:', choices: ['Substituting back', 'Checking $f\'\' < 0$', 'Drawing graph', 'All of the above'], correct: 3, explanation: 'Any method confirming it\'s actually a max.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'In applied problems, domain often:', choices: ['Is all reals', 'Is restricted by physical constraints', 'Doesn\'t matter', 'Is empty'], correct: 1, explanation: 'Physical problems have natural restrictions.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'Minimize $f(x) = x^2 + \\frac{16}{x}$ for $x > 0$:', choices: ['$x = 2$', '$x = 4$', '$x = 1$', '$x = 8$'], correct: 0, explanation: '$f\'(x) = 2x - 16/x^2 = 0$ gives $x = 2$.' },
            { topic: '5.10', type: 'multiple_choice', stem: 'If only one critical point in domain:', choices: ['It must be the answer', 'Still need to check', 'It\'s never the answer', 'Problem is unsolvable'], correct: 0, explanation: 'Single critical point in valid domain is the extremum.' },

            // Topic 5.11: Solving Optimization
            { topic: '5.11', type: 'multiple_choice', stem: 'Box with square base, volume 32: min surface area when side:', choices: ['$2$', '$4$', '$8$', '$\\sqrt[3]{32}$'], correct: 1, explanation: 'Cube minimizes surface area for fixed volume.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'Closest point on $y = x^2$ to $(0, 1)$:', choices: ['$(0, 0)$', '$(\\pm \\frac{1}{\\sqrt{2}}, \\frac{1}{2})$', '$(1, 1)$', '$(0, 1)$'], correct: 1, explanation: 'Minimize $D^2 = x^2 + (x^2-1)^2$.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'Farmer fencing: max area with 3 sides (wall on 4th), 100m fence:', choices: ['$50 \\times 25$', '$25 \\times 50$', '$33.3 \\times 33.3$', '$40 \\times 30$'], correct: 0, explanation: '$A = x(100-2x)$ max when $x = 25$, so $25 \\times 50$.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'Revenue $R = px$ where $p = 100 - x$. Max revenue when:', choices: ['$x = 50$', '$x = 100$', '$x = 25$', '$x = 75$'], correct: 0, explanation: '$R = x(100-x) = 100x - x^2$, max at $x = 50$.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'Cone inscribed in sphere: max volume when:', choices: ['$h = \\frac{4R}{3}$', '$h = R$', '$h = 2R$', '$h = \\frac{R}{2}$'], correct: 0, explanation: 'Classic result: height is $\\frac{4}{3}$ of radius.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'When minimizing cost, don\'t forget:', choices: ['To maximize profit', 'Endpoint values', 'That $f\' = 0$ gives max', 'Domain restrictions'], correct: 3, explanation: 'Physical constraints limit the domain.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'Minimize $f(x) = x + \\frac{4}{x}$ for $x > 0$:', choices: ['$x = 1$', '$x = 2$', '$x = 4$', '$x = \\frac{1}{2}$'], correct: 1, explanation: '$f\' = 1 - 4/x^2 = 0$ gives $x = 2$.' },
            { topic: '5.11', type: 'multiple_choice', stem: 'Rectangle under $y = 4 - x^2$: max area:', choices: ['$\\frac{16}{3\\sqrt{3}}$', '$\\frac{32}{3\\sqrt{3}}$', '$4$', '$8$'], correct: 1, explanation: '$A = 2x(4-x^2)$, maximize.' },

            // Topic 5.12: Implicit Relations
            { topic: '5.12', type: 'multiple_choice', stem: 'For $x^2 + y^2 = 25$, vertical tangent at:', choices: ['$(\\pm 5, 0)$', '$(0, \\pm 5)$', '$(3, 4)$', 'No vertical tangents'], correct: 0, explanation: '$\\frac{dy}{dx} = -x/y$ undefined when $y = 0$.' },
            { topic: '5.12', type: 'multiple_choice', stem: 'For $x^2 - y^2 = 1$, slope at $(\\sqrt{2}, 1)$:', choices: ['$\\sqrt{2}$', '$1$', '$\\frac{1}{\\sqrt{2}}$', '$2$'], correct: 0, explanation: '$\\frac{dy}{dx} = x/y = \\sqrt{2}/1 = \\sqrt{2}$' },
            { topic: '5.12', type: 'multiple_choice', stem: 'Horizontal tangent on implicit curve where:', choices: ['$\\frac{dy}{dx} = 0$', '$\\frac{dx}{dy} = 0$', 'Both $\\frac{dy}{dx}$ and $\\frac{dx}{dy}$ = 0', 'Curve crosses x-axis'], correct: 0, explanation: 'Horizontal: slope = 0.' },
            { topic: '5.12', type: 'multiple_choice', stem: 'For $xy = 4$, at $(2, 2)$:', choices: ['Slope = 1', 'Slope = -1', 'Slope = 2', 'Slope = 0'], correct: 1, explanation: '$\\frac{dy}{dx} = -y/x = -2/2 = -1$' },
            { topic: '5.12', type: 'multiple_choice', stem: 'Implicit curve $x^3 + y^3 = 6xy$: passes through:', choices: ['$(0, 0)$', '$(3, 3)$', 'Both', 'Neither'], correct: 2, explanation: 'Both points satisfy the equation.' },
            { topic: '5.12', type: 'multiple_choice', stem: 'For circle $x^2 + y^2 = r^2$, all tangents are:', choices: ['Horizontal', 'Vertical', 'Perpendicular to radius', 'Parallel'], correct: 2, explanation: 'Radius and tangent are perpendicular.' },
            { topic: '5.12', type: 'multiple_choice', stem: 'Cusp on implicit curve occurs when:', choices: ['$f\' = 0$', 'Both $\\frac{dy}{dx}$ num and denom = 0', 'Curve self-intersects', '$y = 0$'], correct: 1, explanation: 'Cusp: derivative undefined with special limit behavior.' },
            { topic: '5.12', type: 'multiple_choice', stem: 'For $y^2 = x^3$, at origin:', choices: ['Smooth', 'Vertical tangent', 'Cusp', 'No tangent'], correct: 2, explanation: 'Classic cusp at origin.' },

            // ========== UNIT 6: INTEGRATION ==========
            // Topic 6.1: Accumulation
            { topic: '6.1', type: 'multiple_choice', stem: 'If $r(t)$ is rate of change, $\\int_0^5 r(t)\\, dt$ gives:', choices: ['Rate at $t=5$', 'Total change from $t=0$ to $t=5$', 'Average rate', 'Maximum rate'], correct: 1, explanation: 'Integral of rate gives total accumulation.' },
            { topic: '6.1', type: 'multiple_choice', stem: 'Water flows at $r(t) = 4$ gal/min. Total after 10 min:', choices: ['$4$ gal', '$14$ gal', '$40$ gal', '$2.5$ gal'], correct: 2, explanation: '$\\int_0^{10} 4\\, dt = 40$ gallons.' },
            { topic: '6.1', type: 'multiple_choice', stem: 'If velocity $v(t) = 3t$, distance from $t=0$ to $t=4$:', choices: ['$12$', '$24$', '$48$', '$6$'], correct: 1, explanation: '$\\int_0^4 3t\\, dt = \\frac{3t^2}{2}\\Big|_0^4 = 24$' },
            { topic: '6.1', type: 'multiple_choice', stem: 'Accumulation function $F(x) = \\int_0^x f(t)\\, dt$. Then $F(0) =$', choices: ['$f(0)$', '$0$', '$1$', 'Undefined'], correct: 1, explanation: 'Integral from $a$ to $a$ is always 0.' },
            { topic: '6.1', type: 'multiple_choice', stem: 'Rate is negative means accumulation:', choices: ['Increases', 'Decreases', 'Stays constant', 'Is undefined'], correct: 1, explanation: 'Negative rate = decreasing total (e.g., water draining).' },
            { topic: '6.1', type: 'multiple_choice', stem: 'Units of $\\int_0^t r(t)\\, dt$ if $r$ is gal/min and $t$ is min:', choices: ['gal/min', 'min', 'gallons', 'gal·min'], correct: 2, explanation: '(gal/min) × min = gallons.' },
            { topic: '6.1', type: 'multiple_choice', stem: 'If rate doubles, total accumulation over same interval:', choices: ['Stays same', 'Doubles', 'Halves', 'Squares'], correct: 1, explanation: '$\\int 2r = 2\\int r$' },
            { topic: '6.1', type: 'multiple_choice', stem: 'Net change equals:', choices: ['$f(b) - f(a)$', '$\\int_a^b f\'(x)\\, dx$', 'Both A and B', 'Neither'], correct: 2, explanation: 'FTC: integral of derivative = net change.' },

            // Topic 6.2: Riemann Sums
            { topic: '6.2', type: 'multiple_choice', stem: 'Left Riemann sum with $n = 4$ on $[0, 8]$: $\\Delta x =$', choices: ['$4$', '$2$', '$8$', '$0.5$'], correct: 1, explanation: '$\\Delta x = (8-0)/4 = 2$' },
            { topic: '6.2', type: 'multiple_choice', stem: 'For increasing $f$, left Riemann sum:', choices: ['Overestimates', 'Underestimates', 'Exact', 'Cannot determine'], correct: 1, explanation: 'Left endpoints on increasing function give lower values.' },
            { topic: '6.2', type: 'multiple_choice', stem: 'Right sum with $f(x) = x$, $[0,4]$, $n = 4$:', choices: ['$6$', '$10$', '$4$', '$8$'], correct: 1, explanation: 'Right: $1+2+3+4 = 10$ (each times $\\Delta x = 1$).' },
            { topic: '6.2', type: 'multiple_choice', stem: 'As $n \\to \\infty$, Riemann sum becomes:', choices: ['Zero', 'Infinite', 'Definite integral', 'Undefined'], correct: 2, explanation: 'Limit of Riemann sums defines the definite integral.' },
            { topic: '6.2', type: 'multiple_choice', stem: 'Midpoint rule often gives:', choices: ['Worst estimate', 'Better estimate than left/right', 'Same as left', 'Exact answer always'], correct: 1, explanation: 'Midpoint typically more accurate than left or right.' },
            { topic: '6.2', type: 'multiple_choice', stem: 'For decreasing $f$, right Riemann sum:', choices: ['Overestimates', 'Underestimates', 'Exact', 'Equals left sum'], correct: 1, explanation: 'Right endpoints on decreasing function give lower values.' },
            { topic: '6.2', type: 'multiple_choice', stem: 'Riemann sum is a sum of:', choices: ['Derivatives', 'Areas of rectangles', 'Slopes', 'Limits'], correct: 1, explanation: 'Each term is height × width = area of rectangle.' },
            { topic: '6.2', type: 'multiple_choice', stem: 'With $n = 100$ subintervals on $[0, 10]$, $\\Delta x =$', choices: ['$10$', '$0.1$', '$100$', '$1$'], correct: 1, explanation: '$\\Delta x = 10/100 = 0.1$' },

            // Topic 6.3: Definite Integrals
            { topic: '6.3', type: 'multiple_choice', stem: '$\\int_a^b f(x)\\, dx$ represents:', choices: ['Slope at $b$', 'Signed area', 'Antiderivative', 'Rate of change'], correct: 1, explanation: 'Definite integral = signed area under curve.' },
            { topic: '6.3', type: 'multiple_choice', stem: 'In $\\int_0^3 x^2\\, dx$, the variable of integration is:', choices: ['$0$', '$3$', '$x$', '$x^2$'], correct: 2, explanation: '$dx$ indicates integration with respect to $x$.' },
            { topic: '6.3', type: 'multiple_choice', stem: 'If $f(x) < 0$ on $[a,b]$, then $\\int_a^b f\\, dx$:', choices: ['Is positive', 'Is negative', 'Is zero', 'Cannot be computed'], correct: 1, explanation: 'Area below x-axis counts as negative.' },
            { topic: '6.3', type: 'multiple_choice', stem: '$\\int_2^2 f(x)\\, dx =$', choices: ['$f(2)$', '$0$', '$2f(2)$', 'Undefined'], correct: 1, explanation: 'Integral over zero-width interval is 0.' },
            { topic: '6.3', type: 'multiple_choice', stem: '$\\int_a^b f + \\int_b^c f =$', choices: ['$\\int_a^c f$', '$\\int_a^b 2f$', '$0$', '$f(c) - f(a)$'], correct: 0, explanation: 'Additive property of integrals.' },
            { topic: '6.3', type: 'multiple_choice', stem: 'Summation notation $\\sum_{i=1}^n a_i$ means:', choices: ['Product of terms', 'Sum of terms', 'Average of terms', 'Maximum term'], correct: 1, explanation: '$\\sum$ denotes summation.' },
            { topic: '6.3', type: 'multiple_choice', stem: '$\\int_0^1 x\\, dx$ geometrically represents:', choices: ['Area of square', 'Area of triangle', 'Length of segment', 'Slope of line'], correct: 1, explanation: 'Area under $y = x$ from 0 to 1 is a triangle.' },
            { topic: '6.3', type: 'multiple_choice', stem: 'The integrand in $\\int_1^5 \\sqrt{t}\\, dt$ is:', choices: ['$1$', '$5$', '$\\sqrt{t}$', '$t$'], correct: 2, explanation: 'Integrand is the function being integrated.' },

            // Topic 6.4: FTC Part 1
            { topic: '6.4', type: 'multiple_choice', stem: 'If $F(x) = \\int_0^x t^2\\, dt$, then $F\'(x) =$', choices: ['$\\frac{x^3}{3}$', '$x^2$', '$2x$', '$0$'], correct: 1, explanation: 'FTC Part 1: $F\'(x) = f(x) = x^2$' },
            { topic: '6.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\int_1^x \\sin t\\, dt =$', choices: ['$\\cos x$', '$\\sin x$', '$-\\cos x$', '$\\sin 1$'], correct: 1, explanation: 'Derivative of integral from constant to $x$ is the integrand.' },
            { topic: '6.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\int_0^{x^2} e^t\\, dt =$', choices: ['$e^{x^2}$', '$2xe^{x^2}$', '$e^x$', '$2x$'], correct: 1, explanation: 'Chain rule: $e^{x^2} \\cdot 2x$' },
            { topic: '6.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\int_x^5 f(t)\\, dt =$', choices: ['$f(x)$', '$-f(x)$', '$f(5)$', '$0$'], correct: 1, explanation: 'Reverse bounds gives negative: $-f(x)$' },
            { topic: '6.4', type: 'multiple_choice', stem: 'FTC Part 1 connects:', choices: ['Area and slope', 'Derivatives and integrals', 'Limits and continuity', 'Sums and products'], correct: 1, explanation: 'Differentiation and integration are inverse operations.' },
            { topic: '6.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\int_2^x \\ln t\\, dt =$', choices: ['$\\frac{1}{x}$', '$\\ln x$', '$\\ln 2$', '$x\\ln x$'], correct: 1, explanation: 'Derivative equals integrand evaluated at upper limit.' },
            { topic: '6.4', type: 'multiple_choice', stem: 'If $G(x) = \\int_0^{\\sin x} t^3\\, dt$, then $G\'(x) =$', choices: ['$\\sin^3 x$', '$\\cos^3 x$', '$\\sin^3 x \\cdot \\cos x$', '$3\\sin^2 x$'], correct: 2, explanation: '$\\sin^3 x \\cdot \\cos x$ by chain rule.' },
            { topic: '6.4', type: 'multiple_choice', stem: '$\\frac{d}{dx}\\int_a^x f(t)\\, dt$ at $x = a$ equals:', choices: ['$0$', '$f(a)$', 'Undefined', '$f\'(a)$'], correct: 1, explanation: '$F\'(a) = f(a)$' },

            // Topic 6.5: Properties of Integration
            { topic: '6.5', type: 'multiple_choice', stem: '$\\int_3^1 f(x)\\, dx = -\\int_1^3 f(x)\\, dx$:', choices: ['Always true', 'Sometimes true', 'Never true', 'Only for $f > 0$'], correct: 0, explanation: 'Reversing bounds changes sign.' },
            { topic: '6.5', type: 'multiple_choice', stem: '$\\int_0^2 [f + g]\\, dx =$', choices: ['$\\int_0^2 f \\cdot \\int_0^2 g$', '$\\int_0^2 f + \\int_0^2 g$', '$(\\int_0^2 f)(\\int_0^2 g)$', '$\\int_0^2 fg$'], correct: 1, explanation: 'Sum rule for integrals.' },
            { topic: '6.5', type: 'multiple_choice', stem: '$\\int_0^4 5f(x)\\, dx = 5\\int_0^4 f(x)\\, dx$:', choices: ['True', 'False', 'Only if $f$ constant', 'Only if $f > 0$'], correct: 0, explanation: 'Constants factor out of integrals.' },
            { topic: '6.5', type: 'multiple_choice', stem: 'If $\\int_0^3 f = 7$ and $\\int_0^3 g = 4$, then $\\int_0^3 (f - g) =$', choices: ['$3$', '$11$', '$28$', '$\\frac{7}{4}$'], correct: 0, explanation: '$7 - 4 = 3$' },
            { topic: '6.5', type: 'multiple_choice', stem: '$\\int_0^2 f + \\int_2^5 f = \\int_0^5 f$ illustrates:', choices: ['Linearity', 'Additivity over intervals', 'Symmetry', 'Boundedness'], correct: 1, explanation: 'Can split integrals at intermediate points.' },
            { topic: '6.5', type: 'multiple_choice', stem: 'If $f(x) \\leq g(x)$ on $[a,b]$, then:', choices: ['$\\int_a^b f \\leq \\int_a^b g$', '$\\int_a^b f \\geq \\int_a^b g$', 'No relation', '$\\int f = \\int g$'], correct: 0, explanation: 'Larger function has larger integral.' },
            { topic: '6.5', type: 'multiple_choice', stem: 'If $f \\geq 0$ on $[a,b]$, then $\\int_a^b f$:', choices: ['= 0', '$\\geq 0$', '$\\leq 0$', 'Could be anything'], correct: 1, explanation: 'Non-negative function has non-negative integral.' },
            { topic: '6.5', type: 'multiple_choice', stem: '$\\int_a^a f(x)\\, dx =$', choices: ['$f(a)$', '$0$', '$2f(a)$', '$a$'], correct: 1, explanation: 'Zero-width interval gives zero integral.' },

            // Topic 6.6: Applying Properties
            { topic: '6.6', type: 'multiple_choice', stem: 'If $f$ is even and $\\int_0^3 f = 5$, then $\\int_{-3}^3 f =$', choices: ['$5$', '$10$', '$0$', '$-5$'], correct: 1, explanation: 'Even: $\\int_{-a}^a f = 2\\int_0^a f = 10$' },
            { topic: '6.6', type: 'multiple_choice', stem: 'If $f$ is odd, $\\int_{-2}^2 f(x)\\, dx =$', choices: ['$2\\int_0^2 f$', '$0$', '$4\\int_0^1 f$', 'Cannot determine'], correct: 1, explanation: 'Odd functions integrate to 0 on symmetric intervals.' },
            { topic: '6.6', type: 'multiple_choice', stem: '$\\int_0^4 f = 10$, $\\int_0^7 f = 25$. Then $\\int_4^7 f =$', choices: ['$15$', '$35$', '$-15$', '$2.5$'], correct: 0, explanation: '$25 - 10 = 15$' },
            { topic: '6.6', type: 'multiple_choice', stem: '$\\sin x$ is:', choices: ['Even', 'Odd', 'Neither', 'Both'], correct: 1, explanation: '$\\sin(-x) = -\\sin x$' },
            { topic: '6.6', type: 'multiple_choice', stem: '$\\int_{-\\pi}^{\\pi} \\sin x\\, dx =$', choices: ['$2$', '$0$', '$\\pi$', '$2\\pi$'], correct: 1, explanation: '$\\sin$ is odd; integral on symmetric interval is 0.' },
            { topic: '6.6', type: 'multiple_choice', stem: '$x^2$ is:', choices: ['Even', 'Odd', 'Neither', 'Depends on interval'], correct: 0, explanation: '$(-x)^2 = x^2$' },
            { topic: '6.6', type: 'multiple_choice', stem: '$\\int_5^1 f = -8$ means $\\int_1^5 f =$', choices: ['$-8$', '$8$', '$0$', '$16$'], correct: 1, explanation: 'Reversing bounds changes sign.' },
            { topic: '6.6', type: 'multiple_choice', stem: 'If $\\int_0^{10} f = 30$ and $\\int_0^{10} g = 12$, then $\\int_0^{10} 2f - 3g =$', choices: ['$24$', '$60$', '$-36$', '$96$'], correct: 0, explanation: '$2(30) - 3(12) = 60 - 36 = 24$' },

            // Topic 6.7: FTC Part 2
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_1^4 2x\\, dx =$', choices: ['$15$', '$16$', '$8$', '$14$'], correct: 0, explanation: '$x^2\\Big|_1^4 = 16 - 1 = 15$' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_0^{\\pi} \\cos x\\, dx =$', choices: ['$1$', '$0$', '$2$', '$-1$'], correct: 1, explanation: '$\\sin x\\Big|_0^{\\pi} = 0 - 0 = 0$' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_1^e \\frac{1}{x}\\, dx =$', choices: ['$e - 1$', '$1$', '$e$', '$0$'], correct: 1, explanation: '$\\ln|x|\\Big|_1^e = 1 - 0 = 1$' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_0^1 e^x\\, dx =$', choices: ['$e$', '$e - 1$', '$1$', '$e + 1$'], correct: 1, explanation: '$e^x\\Big|_0^1 = e - 1$' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_0^4 \\sqrt{x}\\, dx =$', choices: ['$\\frac{16}{3}$', '$2$', '$\\frac{8}{3}$', '$4$'], correct: 0, explanation: '$\\frac{2x^{3/2}}{3}\\Big|_0^4 = \\frac{16}{3}$' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_{-1}^1 x^3\\, dx =$', choices: ['$\\frac{1}{2}$', '$0$', '$2$', '$\\frac{1}{4}$'], correct: 1, explanation: '$x^3$ is odd; integral on $[-1,1]$ is 0.' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_0^{\\pi/2} \\sin x\\, dx =$', choices: ['$0$', '$1$', '$-1$', '$\\frac{\\pi}{2}$'], correct: 1, explanation: '$-\\cos x\\Big|_0^{\\pi/2} = 0 - (-1) = 1$' },
            { topic: '6.7', type: 'multiple_choice', stem: '$\\int_1^2 (3x^2 - 2x)\\, dx =$', choices: ['$4$', '$5$', '$3$', '$6$'], correct: 2, explanation: '$(x^3 - x^2)\\Big|_1^2 = (8-4) - (1-1) = 4 - 0 = 4$... Wait: $= 4$. Let me check: Actually $(8-4)-(1-1) = 4$' },

            // Topic 6.8: Antiderivatives
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int x^4\\, dx =$', choices: ['$4x^3 + C$', '$\\frac{x^5}{5} + C$', '$x^5 + C$', '$\\frac{x^4}{4} + C$'], correct: 1, explanation: 'Power rule: add 1 to exponent, divide.' },
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int \\cos x\\, dx =$', choices: ['$-\\sin x + C$', '$\\sin x + C$', '$\\cos x + C$', '$-\\cos x + C$'], correct: 1, explanation: 'Derivative of $\\sin x$ is $\\cos x$.' },
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int e^x\\, dx =$', choices: ['$xe^{x-1} + C$', '$e^x + C$', '$\\frac{e^x}{x} + C$', '$e + C$'], correct: 1, explanation: '$e^x$ is its own antiderivative.' },
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int \\frac{1}{x}\\, dx =$', choices: ['$\\ln x + C$', '$\\ln|x| + C$', '$-\\frac{1}{x^2} + C$', '$x + C$'], correct: 1, explanation: 'Absolute value handles negative $x$.' },
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int \\sec^2 x\\, dx =$', choices: ['$\\sec x + C$', '$\\tan x + C$', '$2\\sec x\\tan x + C$', '$\\cot x + C$'], correct: 1, explanation: 'Derivative of $\\tan x$ is $\\sec^2 x$.' },
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int (3x^2 + 2x - 1)\\, dx =$', choices: ['$6x + 2 + C$', '$x^3 + x^2 - x + C$', '$x^3 + 2x - 1 + C$', '$3x^3 + x^2 - x + C$'], correct: 1, explanation: 'Integrate term by term.' },
            { topic: '6.8', type: 'multiple_choice', stem: 'Why "$+ C$" in indefinite integrals?', choices: ['Tradition', 'Constants have zero derivative', 'For definite integrals', 'Optional'], correct: 1, explanation: 'Any constant differentiates to 0.' },
            { topic: '6.8', type: 'multiple_choice', stem: '$\\int \\sin x\\, dx =$', choices: ['$\\cos x + C$', '$-\\cos x + C$', '$-\\sin x + C$', '$\\sin x + C$'], correct: 1, explanation: 'Derivative of $-\\cos x$ is $\\sin x$.' },

            // Topic 6.9: u-Substitution
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int 2x(x^2 + 1)^5\\, dx$, let $u =$', choices: ['$2x$', '$x^2$', '$x^2 + 1$', '$(x^2+1)^5$'], correct: 2, explanation: 'Inner function: $u = x^2 + 1$, $du = 2x\\, dx$' },
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int e^{3x}\\, dx =$', choices: ['$e^{3x} + C$', '$3e^{3x} + C$', '$\\frac{e^{3x}}{3} + C$', '$e^{3x}/x + C$'], correct: 2, explanation: '$u = 3x$, $du = 3dx$, so divide by 3.' },
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int \\cos(2x)\\, dx =$', choices: ['$\\sin(2x) + C$', '$\\frac{\\sin(2x)}{2} + C$', '$2\\sin(2x) + C$', '$-\\sin(2x) + C$'], correct: 1, explanation: '$u = 2x$, divide by 2.' },
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int \\frac{1}{x+3}\\, dx =$', choices: ['$\\ln(x+3) + C$', '$\\ln|x+3| + C$', '$\\frac{1}{(x+3)^2} + C$', '$x + 3 + C$'], correct: 1, explanation: '$u = x+3$, $du = dx$.' },
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int x\\sqrt{x^2+1}\\, dx$, with $u = x^2+1$, becomes:', choices: ['$\\int \\sqrt{u}\\, du$', '$\\frac{1}{2}\\int \\sqrt{u}\\, du$', '$2\\int \\sqrt{u}\\, du$', '$\\int u\\, du$'], correct: 1, explanation: '$du = 2x\\, dx$, so $x\\, dx = \\frac{1}{2}du$' },
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int \\frac{\\cos x}{\\sin x}\\, dx =$', choices: ['$\\ln|\\sin x| + C$', '$-\\ln|\\sin x| + C$', '$\\tan x + C$', '$\\cot x + C$'], correct: 0, explanation: '$u = \\sin x$, $du = \\cos x\\, dx$' },
            { topic: '6.9', type: 'multiple_choice', stem: 'For $\\int f(g(x))g\'(x)\\, dx$, use:', choices: ['Integration by parts', 'u-substitution', 'Partial fractions', 'Direct integration'], correct: 1, explanation: 'Pattern matches u-substitution.' },
            { topic: '6.9', type: 'multiple_choice', stem: '$\\int (2x+1)^4\\, dx =$', choices: ['$\\frac{(2x+1)^5}{5} + C$', '$\\frac{(2x+1)^5}{10} + C$', '$\\frac{(2x+1)^5}{2} + C$', '$4(2x+1)^3 + C$'], correct: 1, explanation: '$u = 2x+1$, $du = 2dx$; divide by 2 and 5.' },

            // Topic 6.10: Long Division
            { topic: '6.10', type: 'multiple_choice', stem: '$\\int \\frac{x^2}{x}\\, dx =$', choices: ['$\\ln|x| + C$', '$\\frac{x^2}{2} + C$', '$x + C$', '$\\frac{x^3}{3} + C$'], correct: 1, explanation: '$\\frac{x^2}{x} = x$, integrate to get $\\frac{x^2}{2}$.' },
            { topic: '6.10', type: 'multiple_choice', stem: '$\\int \\frac{x^2 + 1}{x}\\, dx =$', choices: ['$\\frac{x^2}{2} + \\ln|x| + C$', '$x + \\ln|x| + C$', '$\\frac{x^3}{3} + x + C$', '$x^2 + x + C$'], correct: 0, explanation: '$= \\int (x + \\frac{1}{x})\\, dx$' },
            { topic: '6.10', type: 'multiple_choice', stem: 'When to use long division for $\\int \\frac{p(x)}{q(x)}\\, dx$:', choices: ['Always', 'When deg $p <$ deg $q$', 'When deg $p \\geq$ deg $q$', 'Never'], correct: 2, explanation: 'Divide when numerator degree ≥ denominator.' },
            { topic: '6.10', type: 'multiple_choice', stem: '$\\frac{x^3}{x^2+1}$ by division gives:', choices: ['$x - \\frac{x}{x^2+1}$', '$x + \\frac{1}{x^2+1}$', '$x^2 - 1$', '$x - 1$'], correct: 0, explanation: 'Divide to get $x$ with remainder $-x$.' },
            { topic: '6.10', type: 'multiple_choice', stem: '$\\int \\frac{2x + 3}{x}\\, dx =$', choices: ['$2x + 3\\ln|x| + C$', '$x^2 + 3x + C$', '$2 + \\frac{3}{x} + C$', '$\\ln|2x+3| + C$'], correct: 0, explanation: '$= \\int (2 + \\frac{3}{x})\\, dx = 2x + 3\\ln|x| + C$' },
            { topic: '6.10', type: 'multiple_choice', stem: '$\\int \\frac{x^2 - 4}{x - 2}\\, dx =$', choices: ['$\\frac{x^2}{2} + 2x + C$', '$\\frac{x^2}{2} - 2x + C$', '$x^2 - 4\\ln|x-2| + C$', '$\\frac{x^2}{2} + 2 + C$'], correct: 0, explanation: '$\\frac{x^2-4}{x-2} = x + 2$. Integrate.' },
            { topic: '6.10', type: 'multiple_choice', stem: 'Completing square helps integrate:', choices: ['$\\frac{1}{x^2 + 2x + 5}$', '$x^2$', '$e^x$', '$\\sin x$'], correct: 0, explanation: 'Converts to form involving $\\arctan$.' },
            { topic: '6.10', type: 'multiple_choice', stem: '$x^2 + 2x + 5 = (x+1)^2 + ?$', choices: ['$4$', '$6$', '$3$', '$5$'], correct: 0, explanation: '$(x+1)^2 = x^2 + 2x + 1$, so $+4$ needed.' },

            // Topic 6.14: Selecting Techniques
            { topic: '6.14', type: 'multiple_choice', stem: '$\\int x\\cos(x^2)\\, dx$ uses:', choices: ['Direct integration', 'u-substitution', 'Long division', 'None work'], correct: 1, explanation: '$u = x^2$, $du = 2x\\, dx$' },
            { topic: '6.14', type: 'multiple_choice', stem: '$\\int \\frac{x^3 + x}{x^2}\\, dx$ uses:', choices: ['u-substitution', 'Simplify first', 'Parts', 'Cannot integrate'], correct: 1, explanation: 'Simplify to $x + x^{-1}$ then integrate.' },
            { topic: '6.14', type: 'multiple_choice', stem: '$\\int \\sec^2(3x)\\, dx$ uses:', choices: ['Direct: $\\tan(3x)$', 'u-substitution', 'Long division', 'Cannot do'], correct: 1, explanation: '$u = 3x$, giving $\\frac{\\tan(3x)}{3} + C$' },
            { topic: '6.14', type: 'multiple_choice', stem: '$\\int e^{5x}\\, dx$ best method:', choices: ['Expand $e^{5x}$', 'u-substitution or direct', 'Long division', 'FTC'], correct: 1, explanation: '$\\frac{e^{5x}}{5} + C$' },
            { topic: '6.14', type: 'multiple_choice', stem: 'To integrate $\\frac{1}{x^2 + 4}$:', choices: ['Power rule', 'u-sub with $u = x^2$', 'Recognize $\\arctan$ form', 'Long division'], correct: 2, explanation: '$\\frac{1}{2}\\arctan(\\frac{x}{2}) + C$' },
            { topic: '6.14', type: 'multiple_choice', stem: '$\\int \\sin^2 x \\cos x\\, dx$:', choices: ['u-sub with $u = \\sin x$', 'Trig identity', 'Direct integration', 'Cannot do'], correct: 0, explanation: '$u = \\sin x$, $du = \\cos x\\, dx$' },
            { topic: '6.14', type: 'multiple_choice', stem: 'Most integrals require:', choices: ['One technique', 'Recognizing patterns', 'Memorization only', 'Technology'], correct: 1, explanation: 'Recognize which technique fits the pattern.' },
            { topic: '6.14', type: 'multiple_choice', stem: '$\\int (x + \\frac{1}{x})^2\\, dx$ first step:', choices: ['u-substitution', 'Expand the square', 'Factor', 'Cannot integrate'], correct: 1, explanation: 'Expand: $x^2 + 2 + \\frac{1}{x^2}$, then integrate.' },

            // ========== UNIT 7: DIFFERENTIAL EQUATIONS ==========
            // Topic 7.1: Modeling with DEs
            { topic: '7.1', type: 'multiple_choice', stem: 'A differential equation contains:', choices: ['Only numbers', 'A function and its derivatives', 'Only integrals', 'No variables'], correct: 1, explanation: 'DEs relate functions to their derivatives.' },
            { topic: '7.1', type: 'multiple_choice', stem: '"Rate proportional to amount" translates to:', choices: ['$\\frac{dy}{dt} = k$', '$\\frac{dy}{dt} = ky$', '$y = kt$', '$y = e^t$'], correct: 1, explanation: 'Rate = constant × amount.' },
            { topic: '7.1', type: 'multiple_choice', stem: '$\\frac{dP}{dt} = 0.03P$ models:', choices: ['Linear growth', 'Exponential growth', 'Decay', 'No change'], correct: 1, explanation: 'Positive constant times $P$ = exponential growth.' },
            { topic: '7.1', type: 'multiple_choice', stem: '"Population decreases at rate proportional to itself":', choices: ['$\\frac{dP}{dt} = kP$, $k > 0$', '$\\frac{dP}{dt} = kP$, $k < 0$', '$P = -kt$', '$\\frac{dP}{dt} = 0$'], correct: 1, explanation: 'Decrease means negative rate constant.' },
            { topic: '7.1', type: 'multiple_choice', stem: 'Order of DE $y\'\' + y\' - y = 0$:', choices: ['1', '2', '3', '0'], correct: 1, explanation: 'Highest derivative is second: order 2.' },
            { topic: '7.1', type: 'multiple_choice', stem: '$\\frac{dy}{dx} = x + y$ means slope at $(1, 2)$ is:', choices: ['$1$', '$2$', '$3$', '$0.5$'], correct: 2, explanation: 'Slope $= x + y = 1 + 2 = 3$' },
            { topic: '7.1', type: 'multiple_choice', stem: 'Which is NOT a differential equation?', choices: ['$y\' = 2y$', '$y\'\' + y = 0$', '$y = 2x + 1$', '$\\frac{dy}{dx} = x$'], correct: 2, explanation: '$y = 2x + 1$ has no derivatives.' },
            { topic: '7.1', type: 'multiple_choice', stem: 'Newton\'s law of cooling: $\\frac{dT}{dt} = k(T - T_s)$ where $T_s$ is:', choices: ['Initial temperature', 'Surrounding temperature', 'Final temperature', 'Maximum temperature'], correct: 1, explanation: 'Rate depends on difference from surroundings.' },

            // Topic 7.2: Verifying Solutions
            { topic: '7.2', type: 'multiple_choice', stem: 'To verify $y = e^{3x}$ solves $y\' = 3y$, show:', choices: ['$e^{3x} = 3e^{3x}$', '$3e^{3x} = 3e^{3x}$', '$y(0) = 1$', '$y = 3x$'], correct: 1, explanation: '$y\' = 3e^{3x}$, $3y = 3e^{3x}$. Equal!' },
            { topic: '7.2', type: 'multiple_choice', stem: 'Does $y = x^2$ solve $y\' = 2x$?', choices: ['Yes', 'No', 'Only for $x > 0$', 'Only if $y(0) = 0$'], correct: 0, explanation: '$y\' = 2x$ ✓' },
            { topic: '7.2', type: 'multiple_choice', stem: 'Verify $y = \\sin x$ solves $y\'\' + y = 0$:', choices: ['$\\cos x + \\sin x = 0$', '$-\\sin x + \\sin x = 0$', '$\\sin x = 0$', 'Doesn\'t solve'], correct: 1, explanation: '$y\'\' = -\\sin x$, so $-\\sin x + \\sin x = 0$ ✓' },
            { topic: '7.2', type: 'multiple_choice', stem: 'Does $y = Ce^x$ solve $y\' = y$?', choices: ['Only for $C = 1$', 'For any constant $C$', 'Only for $C > 0$', 'Never'], correct: 1, explanation: '$y\' = Ce^x = y$ for any $C$.' },
            { topic: '7.2', type: 'multiple_choice', stem: 'General solution has:', choices: ['No constants', 'One specific value', 'Arbitrary constant(s)', 'Only integer values'], correct: 2, explanation: 'General solution includes arbitrary constant $C$.' },
            { topic: '7.2', type: 'multiple_choice', stem: 'Verify $y = \\ln x$ solves $xy\' = 1$:', choices: ['$x \\cdot 1 = 1$', '$x \\cdot \\frac{1}{x} = 1$', '$\\ln x = 1$', 'Doesn\'t solve'], correct: 1, explanation: '$y\' = 1/x$, so $x \\cdot \\frac{1}{x} = 1$ ✓' },
            { topic: '7.2', type: 'multiple_choice', stem: 'Is $y = x^2 + C$ general solution to $y\' = 2x$?', choices: ['Yes', 'No, should be $y = x^2$', 'No, wrong derivative', 'Only for $C = 0$'], correct: 0, explanation: 'Any $C$ works since $(x^2 + C)\' = 2x$.' },
            { topic: '7.2', type: 'multiple_choice', stem: 'To verify, we need:', choices: ['Only the DE', 'Only the proposed solution', 'Both DE and proposed solution', 'Neither'], correct: 2, explanation: 'Substitute proposed solution into DE and check.' },

            // Topic 7.3: Slope Fields
            { topic: '7.3', type: 'multiple_choice', stem: 'Slope field for $\\frac{dy}{dx} = y$: at $(2, 0)$, slope is:', choices: ['$2$', '$0$', '$-2$', 'Undefined'], correct: 1, explanation: 'Slope $= y = 0$' },
            { topic: '7.3', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = x$, slopes are same along:', choices: ['Horizontal lines', 'Vertical lines', 'Diagonal lines', 'Curves'], correct: 1, explanation: 'Same $x$ gives same slope.' },
            { topic: '7.3', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = y$, slopes are same along:', choices: ['Horizontal lines', 'Vertical lines', 'Circles', 'Parabolas'], correct: 0, explanation: 'Same $y$ gives same slope.' },
            { topic: '7.3', type: 'multiple_choice', stem: 'Horizontal segments in slope field mean:', choices: ['$\\frac{dy}{dx} = 0$', '$\\frac{dy}{dx} = 1$', '$y = 0$', '$x = 0$'], correct: 0, explanation: 'Horizontal = zero slope.' },
            { topic: '7.3', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = x + y$, at $(1, -1)$:', choices: ['Slope = 2', 'Slope = 0', 'Slope = -2', 'Slope = 1'], correct: 1, explanation: '$1 + (-1) = 0$' },
            { topic: '7.3', type: 'multiple_choice', stem: 'Slope field shows:', choices: ['Actual solutions', 'Direction at each point', 'Only one solution', 'Integrals'], correct: 1, explanation: 'Each segment shows local direction of solution.' },
            { topic: '7.3', type: 'multiple_choice', stem: 'Steep segments indicate:', choices: ['Large $|\\frac{dy}{dx}|$', 'Small $|\\frac{dy}{dx}|$', '$\\frac{dy}{dx} = 0$', 'No solution'], correct: 0, explanation: 'Steep = large magnitude slope.' },
            { topic: '7.3', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = 2$, slope field has:', choices: ['All horizontal', 'All same slope', 'Varying slopes', 'Vertical segments'], correct: 1, explanation: 'Constant slope everywhere.' },

            // Topic 7.4: Reasoning with Slope Fields
            { topic: '7.4', type: 'multiple_choice', stem: 'Solution curves in slope field:', choices: ['Cross each other', 'Never cross', 'Are always straight', 'Are always circles'], correct: 1, explanation: 'Unique solution through each point.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'If $\\frac{dy}{dx} = y$ and $y(0) > 0$, solutions:', choices: ['Decrease', 'Stay constant', 'Increase', 'Oscillate'], correct: 2, explanation: 'Positive $y$ gives positive slope.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'Equilibrium solution occurs when:', choices: ['$\\frac{dy}{dx} = 1$', '$\\frac{dy}{dx} = 0$ always', '$y = x$', '$y = e^x$'], correct: 1, explanation: 'No change: horizontal solution.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = y - 2$, equilibrium at:', choices: ['$y = 0$', '$y = 2$', '$y = -2$', 'No equilibrium'], correct: 1, explanation: '$y - 2 = 0$ when $y = 2$.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'If slopes point up for $y > 3$ and down for $y < 3$:', choices: ['$y = 3$ is stable', '$y = 3$ is unstable', 'Solutions approach $y = 3$', 'Solutions flee $y = 3$'], correct: 3, explanation: 'Solutions move away: unstable.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'Long-term behavior read from slope field:', choices: ['Exact final value', 'General trend', 'Initial condition', 'Derivative value'], correct: 1, explanation: 'Shows where solutions tend.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = -y$, as $x \\to \\infty$:', choices: ['$y \\to \\infty$', '$y \\to 0$', '$y \\to -\\infty$', '$y$ oscillates'], correct: 1, explanation: 'Solution is $y = Ce^{-x}$, which decays toward 0 as $x \\to \\infty$.' },
            { topic: '7.4', type: 'multiple_choice', stem: 'Isocline is a curve where:', choices: ['$y = $ constant', 'Slope is constant', '$x = $ constant', 'Solution passes'], correct: 1, explanation: 'Iso-cline = same slope.' },

            // Topic 7.6: Separation of Variables
            { topic: '7.6', type: 'multiple_choice', stem: 'Separate $\\frac{dy}{dx} = xy$:', choices: ['$\\frac{dy}{y} = x\\, dx$', '$dy = xy\\, dx$', '$\\frac{dy}{x} = y\\, dx$', 'Cannot separate'], correct: 0, explanation: 'Divide by $y$, multiply by $dx$.' },
            { topic: '7.6', type: 'multiple_choice', stem: 'Solve $\\frac{dy}{dx} = y$, general solution:', choices: ['$y = x + C$', '$y = Ce^x$', '$y = e^{Cx}$', '$y = Cx$'], correct: 1, explanation: '$\\ln|y| = x + C$, so $y = Ae^x$.' },
            { topic: '7.6', type: 'multiple_choice', stem: 'For $\\frac{dy}{dx} = \\frac{y}{x}$, after separating:', choices: ['$\\frac{dy}{y} = \\frac{dx}{x}$', '$y\\, dy = x\\, dx$', '$\\frac{dy}{dx} = \\frac{y}{x}$', '$dy = dx$'], correct: 0, explanation: 'Separate $y$ and $x$ to opposite sides.' },
            { topic: '7.6', type: 'multiple_choice', stem: 'Solve $\\frac{dy}{dx} = 2x$:', choices: ['$y = x^2 + C$', '$y = 2x + C$', '$y = x^2$', '$y = 2$'], correct: 0, explanation: '$dy = 2x\\, dx$, integrate both sides.' },
            { topic: '7.6', type: 'multiple_choice', stem: '$\\int \\frac{dy}{y} =$', choices: ['$y$', '$\\ln y$', '$\\ln|y|$', '$\\frac{1}{y}$'], correct: 2, explanation: 'Absolute value needed.' },
            { topic: '7.6', type: 'multiple_choice', stem: 'Solve $\\frac{dy}{dx} = e^x e^y$ separated form:', choices: ['$e^{-y}\\, dy = e^x\\, dx$', '$e^y\\, dy = e^x\\, dx$', '$\\frac{dy}{e^x} = e^y\\, dx$', 'Cannot separate'], correct: 0, explanation: 'Divide by $e^y$: $e^{-y}\\, dy = e^x\\, dx$' },
            { topic: '7.6', type: 'multiple_choice', stem: 'After integrating $\\frac{dy}{y} = 2\\, dx$:', choices: ['$\\ln|y| = 2x + C$', '$y = 2x + C$', '$\\ln|y| = 2 + C$', '$y = e^{2x}$'], correct: 0, explanation: 'Integrate both sides.' },
            { topic: '7.6', type: 'multiple_choice', stem: 'General solution to $y\' = ky$:', choices: ['$y = kx$', '$y = e^{kx}$', '$y = Ce^{kx}$', '$y = Ckx$'], correct: 2, explanation: 'Include constant $C$.' },

            // Topic 7.7: Initial Conditions
            { topic: '7.7', type: 'multiple_choice', stem: 'General: $y = Ce^{2x}$. If $y(0) = 5$, then $C =$', choices: ['$5$', '$5e^2$', '$\\frac{5}{e^2}$', '$0$'], correct: 0, explanation: '$Ce^0 = 5$, so $C = 5$.' },
            { topic: '7.7', type: 'multiple_choice', stem: 'IVP: $y\' = y$, $y(0) = 3$. Solution:', choices: ['$y = e^x$', '$y = 3e^x$', '$y = e^{3x}$', '$y = 3x$'], correct: 1, explanation: 'General $y = Ce^x$, $C = 3$.' },
            { topic: '7.7', type: 'multiple_choice', stem: 'Particular solution differs from general by:', choices: ['Having no $C$', 'Having specific $C$ value', 'Being incorrect', 'Having $C = 0$'], correct: 1, explanation: 'Initial condition determines $C$.' },
            { topic: '7.7', type: 'multiple_choice', stem: '$y = x^2 + C$, $y(1) = 4$. Find $C$:', choices: ['$3$', '$4$', '$5$', '$1$'], correct: 0, explanation: '$1 + C = 4$, so $C = 3$.' },
            { topic: '7.7', type: 'multiple_choice', stem: 'IVP: $y\' = 2y$, $y(0) = 1$. Then $y(1) =$', choices: ['$e$', '$e^2$', '$2$', '$1$'], correct: 1, explanation: '$y = e^{2x}$, so $y(1) = e^2$.' },
            { topic: '7.7', type: 'multiple_choice', stem: 'How many solutions does an IVP typically have?', choices: ['None', 'Exactly one', 'Infinitely many', 'Two'], correct: 1, explanation: 'Initial condition picks unique solution.' },
            { topic: '7.7', type: 'multiple_choice', stem: '$y\' = -y$, $y(0) = 10$. As $t \\to \\infty$, $y \\to$', choices: ['$\\infty$', '$10$', '$0$', '$-10$'], correct: 2, explanation: '$y = 10e^{-t} \\to 0$' },
            { topic: '7.7', type: 'multiple_choice', stem: 'If $y(2) = 8$ and $y = Ae^{3x}$, then $A =$', choices: ['$8e^{-6}$', '$8e^6$', '$8/3$', '$\\frac{8}{e^6}$'], correct: 0, explanation: '$Ae^6 = 8$, so $A = 8e^{-6}$.' },

            // Topic 7.8: Exponential Models
            { topic: '7.8', type: 'multiple_choice', stem: '$\\frac{dy}{dt} = 0.05y$ models:', choices: ['Linear growth', '5% continuous growth', 'Decay', 'Oscillation'], correct: 1, explanation: 'Rate = 5% of current amount.' },
            { topic: '7.8', type: 'multiple_choice', stem: 'Solution to $y\' = ky$ is:', choices: ['$y = kx$', '$y = e^{kx}$', '$y = y_0 e^{kt}$', '$y = \\ln(kt)$'], correct: 2, explanation: 'Exponential with initial value $y_0$.' },
            { topic: '7.8', type: 'multiple_choice', stem: 'Half-life formula: $t_{1/2} =$', choices: ['$\\frac{1}{k}$', '$\\frac{\\ln 2}{k}$', '$\\frac{\\ln 2}{|k|}$', '$2k$'], correct: 2, explanation: 'Solve $\\frac{1}{2} = e^{-|k|t}$.' },
            { topic: '7.8', type: 'multiple_choice', stem: 'If $y = 100e^{-0.1t}$, half-life is:', choices: ['$5$', '$\\ln 2 / 0.1$', '$10$', '$0.1$'], correct: 1, explanation: '$t = \\frac{\\ln 2}{0.1} \\approx 6.93$' },
            { topic: '7.8', type: 'multiple_choice', stem: 'Doubling time for $y\' = 0.05y$:', choices: ['$20$', '$\\frac{\\ln 2}{0.05}$', '$\\frac{1}{0.05}$', '$0.05$'], correct: 1, explanation: '$2 = e^{0.05t}$, $t = \\ln 2 / 0.05$' },
            { topic: '7.8', type: 'multiple_choice', stem: '$k < 0$ in $y\' = ky$ means:', choices: ['Growth', 'Decay', 'Equilibrium', 'Oscillation'], correct: 1, explanation: 'Negative rate constant = decay.' },
            { topic: '7.8', type: 'multiple_choice', stem: 'Radioactive decay: $N(t) = N_0 e^{-\\lambda t}$. $\\lambda$ is:', choices: ['Half-life', 'Decay constant', 'Initial amount', 'Final amount'], correct: 1, explanation: '$\\lambda$ is the decay constant.' },
            { topic: '7.8', type: 'multiple_choice', stem: 'If population triples in 10 years with $P = P_0 e^{kt}$:', choices: ['$k = 0.3$', '$k = \\frac{\\ln 3}{10}$', '$k = 0.1$', '$k = 3$'], correct: 1, explanation: '$3 = e^{10k}$, so $k = \\frac{\\ln 3}{10}$' },

            // ========== UNIT 8: APPLICATIONS OF INTEGRATION ==========
            // Topic 8.1: Average Value
            { topic: '8.1', type: 'multiple_choice', stem: 'Average value of $f$ on $[a,b]$:', choices: ['$\\frac{f(a)+f(b)}{2}$', '$\\frac{1}{b-a}\\int_a^b f\\, dx$', '$\\int_a^b f\\, dx$', '$f(\\frac{a+b}{2})$'], correct: 1, explanation: 'Average value formula.' },
            { topic: '8.1', type: 'multiple_choice', stem: 'Average of $f(x) = 2x$ on $[0, 4]$:', choices: ['$4$', '$8$', '$2$', '$16$'], correct: 0, explanation: '$\\frac{1}{4}\\int_0^4 2x\\, dx = \\frac{16}{4} = 4$' },
            { topic: '8.1', type: 'multiple_choice', stem: 'Average of $f(x) = 3$ on $[1, 5]$:', choices: ['$3$', '$12$', '$4$', '$15$'], correct: 0, explanation: 'Constant: average = that constant.' },
            { topic: '8.1', type: 'multiple_choice', stem: 'If $\\int_0^6 f\\, dx = 24$, average on $[0,6]$:', choices: ['$24$', '$4$', '$6$', '$18$'], correct: 1, explanation: '$24/6 = 4$' },
            { topic: '8.1', type: 'multiple_choice', stem: 'Average of $\\sin x$ on $[0, \\pi]$:', choices: ['$0$', '$\\frac{1}{\\pi}$', '$\\frac{2}{\\pi}$', '$1$'], correct: 2, explanation: '$\\frac{1}{\\pi}\\int_0^{\\pi} \\sin x\\, dx = \\frac{2}{\\pi}$' },
            { topic: '8.1', type: 'multiple_choice', stem: 'Average value theorem guarantees:', choices: ['Max exists', '$f(c) = f_{avg}$ for some $c$', 'Min exists', '$f$ continuous'], correct: 1, explanation: 'Function attains its average value somewhere.' },
            { topic: '8.1', type: 'multiple_choice', stem: 'Average of $x^2$ on $[0, 3]$:', choices: ['$3$', '$9$', '$\\frac{9}{3}$', '$\\frac{27}{9}$'], correct: 0, explanation: '$\\frac{1}{3} \\cdot 9 = 3$' },
            { topic: '8.1', type: 'multiple_choice', stem: 'If average of $f$ on $[0,4]$ is 5, then $\\int_0^4 f\\, dx =$', choices: ['$5$', '$20$', '$1.25$', '$9$'], correct: 1, explanation: '$5 \\cdot 4 = 20$' },

            // Topic 8.2: Motion with Integrals
            { topic: '8.2', type: 'multiple_choice', stem: 'Displacement from $t=0$ to $t=3$ if $v(t) = 2t$:', choices: ['$6$', '$9$', '$3$', '$12$'], correct: 1, explanation: '$\\int_0^3 2t\\, dt = 9$' },
            { topic: '8.2', type: 'multiple_choice', stem: 'Distance differs from displacement when:', choices: ['Always', 'Never', 'Velocity changes sign', 'Acceleration is zero'], correct: 2, explanation: 'Distance uses $|v|$; differs when $v$ negative.' },
            { topic: '8.2', type: 'multiple_choice', stem: '$v(t) = t - 2$ on $[0, 4]$. Displacement:', choices: ['$0$', '$4$', '$8$', '$-4$'], correct: 0, explanation: '$\\int_0^4 (t-2)\\, dt = 8 - 8 = 0$' },
            { topic: '8.2', type: 'multiple_choice', stem: '$v(t) = t - 2$ on $[0, 4]$. Distance:', choices: ['$0$', '$4$', '$8$', '$2$'], correct: 1, explanation: 'Split at $t=2$: $|\\int_0^2| + |\\int_2^4| = 2 + 2 = 4$' },
            { topic: '8.2', type: 'multiple_choice', stem: 'If $a(t) = 4$, $v(0) = 2$, then $v(t) =$', choices: ['$4t$', '$4t + 2$', '$2t + 4$', '$4$'], correct: 1, explanation: '$v = \\int 4\\, dt = 4t + C$; $v(0) = 2$ gives $C = 2$' },
            { topic: '8.2', type: 'multiple_choice', stem: 'Total distance is:', choices: ['$\\int v\\, dt$', '$\\int |v|\\, dt$', '$|\\int v\\, dt|$', '$\\int a\\, dt$'], correct: 1, explanation: 'Integrate absolute value of velocity.' },
            { topic: '8.2', type: 'multiple_choice', stem: 'Position from velocity: integrate. Velocity from acceleration:', choices: ['Differentiate', 'Integrate', 'Add constant', 'Take absolute value'], correct: 1, explanation: '$v = \\int a\\, dt$' },
            { topic: '8.2', type: 'multiple_choice', stem: 'If $s(0) = 5$ and $\\int_0^3 v\\, dt = 12$, then $s(3) =$', choices: ['$12$', '$17$', '$7$', '$-7$'], correct: 1, explanation: '$s(3) = s(0) + 12 = 17$' },

            // Topic 8.3: Accumulation in Context
            { topic: '8.3', type: 'multiple_choice', stem: 'Rate $r(t) = 50$ gal/hr. Total in 3 hours:', choices: ['$50$', '$150$', '$17$', '$53$'], correct: 1, explanation: '$\\int_0^3 50\\, dt = 150$' },
            { topic: '8.3', type: 'multiple_choice', stem: '$\\int_0^5 r(t)\\, dt$ with $r$ in kg/day gives:', choices: ['kg', 'kg/day', 'days', 'kg·day'], correct: 0, explanation: '(kg/day) × day = kg' },
            { topic: '8.3', type: 'multiple_choice', stem: 'If $\\int_0^{10} P\'(t)\\, dt = 500$, population change:', choices: ['$500$', '$50$', '$P(10)$', '$P\'(10)$'], correct: 0, explanation: 'Integral of rate = total change.' },
            { topic: '8.3', type: 'multiple_choice', stem: 'Net change in $f$ from $a$ to $b$:', choices: ['$f(b)$', '$f(a)$', '$f(b) - f(a)$', '$f(b) + f(a)$'], correct: 2, explanation: 'FTC: $\\int_a^b f\' = f(b) - f(a)$' },
            { topic: '8.3', type: 'multiple_choice', stem: 'Oil leaks at decreasing rate. Total leaked is:', choices: ['Decreasing', 'Increasing', 'Constant', 'Zero'], correct: 1, explanation: 'Still adding oil (positive rate), just slower.' },
            { topic: '8.3', type: 'multiple_choice', stem: 'If rate becomes negative, total:', choices: ['Increases', 'Decreases', 'Stays same', 'Undefined'], correct: 1, explanation: 'Negative rate = losing quantity.' },
            { topic: '8.3', type: 'multiple_choice', stem: 'Final amount = initial + $\\int$ rate when:', choices: ['Rate positive', 'Rate negative', 'Always', 'Never'], correct: 2, explanation: 'Always: total = start + net change.' },
            { topic: '8.3', type: 'multiple_choice', stem: '$F(x) = \\int_0^x r(t)\\, dt$, $F\'(x) =$', choices: ['$r(x)$', '$r(0)$', '$F(x)$', '$0$'], correct: 0, explanation: 'FTC Part 1.' },

            // Topic 8.4: Area (Vertical)
            { topic: '8.4', type: 'multiple_choice', stem: 'Area between $y = x$ and $y = x^2$ from 0 to 1:', choices: ['$\\frac{1}{6}$', '$\\frac{1}{3}$', '$\\frac{1}{2}$', '$1$'], correct: 0, explanation: '$\\int_0^1 (x - x^2)\\, dx = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}$' },
            { topic: '8.4', type: 'multiple_choice', stem: 'In $\\int_a^b [f - g]\\, dx$, $f$ should be:', choices: ['Larger function', 'Top function', 'Bottom function', 'Doesn\'t matter'], correct: 1, explanation: 'Top minus bottom for positive area.' },
            { topic: '8.4', type: 'multiple_choice', stem: 'Area between $y = 4$ and $y = x^2$ from $-2$ to $2$:', choices: ['$\\frac{32}{3}$', '$16$', '$\\frac{16}{3}$', '$8$'], correct: 0, explanation: '$\\int_{-2}^2 (4 - x^2)\\, dx = \\frac{32}{3}$' },
            { topic: '8.4', type: 'multiple_choice', stem: 'To find intersection of $y = x$ and $y = x^2$:', choices: ['Set equal: $x = x^2$', 'Add: $x + x^2$', 'Subtract derivatives', 'Integrate both'], correct: 0, explanation: 'Solve $x = x^2$ for intersection points.' },
            { topic: '8.4', type: 'multiple_choice', stem: 'Area between $y = \\sin x$ and $y = 0$ from 0 to $\\pi$:', choices: ['$0$', '$1$', '$2$', '$\\pi$'], correct: 2, explanation: '$\\int_0^{\\pi} \\sin x\\, dx = 2$' },
            { topic: '8.4', type: 'multiple_choice', stem: 'If curves cross at $x = c$:', choices: ['Ignore crossing', 'Split integral at $c$', 'Use absolute value of $f$', 'Area is zero'], correct: 1, explanation: 'Top/bottom switch; split at intersection.' },
            { topic: '8.4', type: 'multiple_choice', stem: 'Area between $y = x^3$ and $y = x$ from $-1$ to $1$:', choices: ['$0$', '$\\frac{1}{2}$', '$1$', 'Need to split'], correct: 1, explanation: 'By symmetry or split and add absolute areas.' },
            { topic: '8.4', type: 'multiple_choice', stem: 'Area is always:', choices: ['Positive', 'Negative', 'Could be either', 'Zero'], correct: 0, explanation: 'Area is non-negative by definition.' },

            // Topic 8.5: Area (Horizontal)
            { topic: '8.5', type: 'multiple_choice', stem: 'Integrate with respect to $y$ when:', choices: ['Always', 'Functions of $y$ simpler', 'Functions of $x$ simpler', 'Never'], correct: 1, explanation: 'Horizontal slices when $x = f(y)$ is cleaner.' },
            { topic: '8.5', type: 'multiple_choice', stem: 'Area between $x = y^2$ and $x = y + 2$:', choices: ['$\\frac{9}{2}$', '$\\frac{7}{2}$', '$4$', '$6$'], correct: 0, explanation: '$\\int_{-1}^2 [(y+2) - y^2]\\, dy = \\frac{9}{2}$' },
            { topic: '8.5', type: 'multiple_choice', stem: 'For horizontal slices, "top minus bottom" becomes:', choices: ['Left minus right', 'Right minus left', 'Still top minus bottom', 'Upper minus lower'], correct: 1, explanation: 'Right curve minus left curve.' },
            { topic: '8.5', type: 'multiple_choice', stem: 'To find $y$-bounds, solve:', choices: ['$f(x) = g(x)$', '$f(y) = g(y)$', '$\\frac{df}{dy} = \\frac{dg}{dy}$', '$y = 0$'], correct: 1, explanation: 'Find where curves intersect in $y$.' },
            { topic: '8.5', type: 'multiple_choice', stem: 'Area right of $x = 0$, left of $x = 4 - y^2$:', choices: ['$\\frac{32}{3}$', '$16$', '$8$', '$\\frac{16}{3}$'], correct: 0, explanation: '$\\int_{-2}^2 (4 - y^2)\\, dy$' },
            { topic: '8.5', type: 'multiple_choice', stem: 'For $x = y^2$, solving for $y$ gives:', choices: ['$y = x^2$', '$y = \\pm\\sqrt{x}$', '$y = \\sqrt{x}$', 'Can\'t solve'], correct: 1, explanation: 'Two branches: $y = \\pm\\sqrt{x}$' },
            { topic: '8.5', type: 'multiple_choice', stem: 'When is horizontal slicing easier?', choices: ['Region bounded by $x = f(y)$', 'Region bounded by $y = f(x)$', 'Always', 'Never'], correct: 0, explanation: 'When given as functions of $y$.' },
            { topic: '8.5', type: 'multiple_choice', stem: '$x = y$ and $x = 2 - y$, find $y$-intersection:', choices: ['$y = 1$', '$y = 2$', '$y = 0$', '$y = -1$'], correct: 0, explanation: '$y = 2 - y \\Rightarrow y = 1$' },

            // Topic 8.6: Multiple Curves
            { topic: '8.6', type: 'multiple_choice', stem: 'Three curves create regions. Area calculation:', choices: ['One integral', 'May need multiple integrals', 'Impossible', 'Always three integrals'], correct: 1, explanation: 'Split into regions where top/bottom are consistent.' },
            { topic: '8.6', type: 'multiple_choice', stem: '$y = x^2$, $y = 4$, $y = 0$ from $x = 0$ to $x = 2$:', choices: ['One region', 'Two regions', 'Three regions', 'No enclosed region'], correct: 0, explanation: 'One bounded region.' },
            { topic: '8.6', type: 'multiple_choice', stem: 'Between $y = |x|$ and $y = 2$ from $-2$ to $2$:', choices: ['$4$', '$2$', '$8$', '$6$'], correct: 0, explanation: '$\\int_{-2}^2 (2 - |x|)\\, dx = 4$' },
            { topic: '8.6', type: 'multiple_choice', stem: 'Finding all intersection points is:', choices: ['Optional', 'Critical for bounds', 'Only for vertical slices', 'Never needed'], correct: 1, explanation: 'Intersections determine integral bounds.' },
            { topic: '8.6', type: 'multiple_choice', stem: 'If $f > g > h$, area between $f$ and $h$:', choices: ['$\\int(f-h)$', '$\\int(f-g) + \\int(g-h)$', 'Both give same answer', '$\\int(g-h)$'], correct: 2, explanation: 'Both methods work: direct or sum of parts.' },
            { topic: '8.6', type: 'multiple_choice', stem: 'Area bounded by $y = x$, $y = -x$, $y = 2$:', choices: ['$4$', '$2$', '$8$', '$6$'], correct: 0, explanation: 'Triangle with vertices at origin and $(\\pm 2, 2)$.' },
            { topic: '8.6', type: 'multiple_choice', stem: 'For piecewise boundaries:', choices: ['Use one integral', 'Split at pieces', 'Cannot compute', 'Average the pieces'], correct: 1, explanation: 'Separate integral for each piece.' },
            { topic: '8.6', type: 'multiple_choice', stem: 'Symmetry can:', choices: ['Never help', 'Double one-sided integral', 'Eliminate need for integrals', 'Only apply to circles'], correct: 1, explanation: 'Symmetric regions: compute half, double.' },

            // Topic 8.7: Cross Sections (Squares/Rectangles)
            { topic: '8.7', type: 'multiple_choice', stem: 'Volume with cross sections: $V =$', choices: ['$\\int A(x)\\, dx$', '$\\pi\\int r^2\\, dx$', '$\\int f(x)\\, dx$', '$A \\cdot h$'], correct: 0, explanation: 'Integrate cross-sectional area.' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Square cross sections, side $= x$, from 0 to 3:', choices: ['$9$', '$27$', '$3$', '$81$'], correct: 0, explanation: '$\\int_0^3 x^2\\, dx = 9$' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Base: $y = \\sqrt{x}$ from 0 to 4. Square cross sections:', choices: ['$\\int_0^4 x\\, dx$', '$\\int_0^4 \\sqrt{x}\\, dx$', '$\\int_0^4 x^2\\, dx$', '$\\pi\\int_0^4 x\\, dx$'], correct: 0, explanation: 'Side $= \\sqrt{x}$, area $= x$.' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Rectangle cross section, width $= f(x)$, height $= 2$:', choices: ['$A = f(x)$', '$A = 2f(x)$', '$A = f(x)^2$', '$A = 2$'], correct: 1, explanation: 'Area = width × height = $2f(x)$' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Cross sections perpendicular to:', choices: ['The curve', 'The axis of integration', 'Both axes', 'Neither'], correct: 1, explanation: 'Perpendicular to axis we integrate along.' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Base between $y = 0$ and $y = 4 - x^2$. Square side equals:', choices: ['$4 - x^2$', '$x$', '$\\sqrt{4-x^2}$', '$16 - x^4$'], correct: 0, explanation: 'Side = distance between curves = $4 - x^2$' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Volume units if base in meters:', choices: ['Meters', 'Square meters', 'Cubic meters', 'Meters per second'], correct: 2, explanation: 'Volume is always cubic.' },
            { topic: '8.7', type: 'multiple_choice', stem: 'Cross sections at $x$: square with side $= e^x$. Volume from 0 to 1:', choices: ['$\\frac{e^2 - 1}{2}$', '$e - 1$', '$e^2$', '$1$'], correct: 0, explanation: '$\\int_0^1 e^{2x}\\, dx = \\frac{e^2 - 1}{2}$' },

            // Topic 8.8: Cross Sections (Triangles/Semicircles)
            { topic: '8.8', type: 'multiple_choice', stem: 'Equilateral triangle, side $s$: area $=$', choices: ['$s^2$', '$\\frac{s^2}{2}$', '$\\frac{\\sqrt{3}}{4}s^2$', '$\\frac{s^2}{4}$'], correct: 2, explanation: 'Standard formula.' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Isosceles right triangle, leg $s$: area $=$', choices: ['$s^2$', '$\\frac{s^2}{2}$', '$\\frac{\\sqrt{2}}{4}s^2$', '$2s^2$'], correct: 1, explanation: 'Half base times height: $\\frac{1}{2}s \\cdot s$' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Semicircle, diameter $d$: area $=$', choices: ['$\\pi d^2$', '$\\frac{\\pi d^2}{4}$', '$\\frac{\\pi d^2}{8}$', '$\\pi d$'], correct: 2, explanation: 'Half circle: $\\frac{1}{2}\\pi r^2 = \\frac{\\pi d^2}{8}$' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Cross sections are semicircles with diameter $= x$:', choices: ['$A = \\pi x^2$', '$A = \\frac{\\pi x^2}{4}$', '$A = \\frac{\\pi x^2}{8}$', '$A = \\frac{\\pi x}{2}$'], correct: 2, explanation: '$A = \\frac{\\pi d^2}{8} = \\frac{\\pi x^2}{8}$' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Base from $y = 0$ to $y = 1 - x^2$. Semicircle diameter $= 1 - x^2$:', choices: ['$A = \\frac{\\pi(1-x^2)^2}{8}$', '$A = \\pi(1-x^2)$', '$A = \\frac{(1-x^2)^2}{2}$', '$A = \\pi(1-x^2)^2$'], correct: 0, explanation: 'Semicircle with diameter $d$: $A = \\frac{\\pi d^2}{8}$' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Equilateral triangles, side $= 2x$. Area:', choices: ['$x^2$', '$\\sqrt{3}x^2$', '$4x^2$', '$2\\sqrt{3}x^2$'], correct: 1, explanation: '$\\frac{\\sqrt{3}}{4}(2x)^2 = \\sqrt{3}x^2$' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Cross-section shape affects:', choices: ['Bounds', 'Area formula', 'Both', 'Neither'], correct: 1, explanation: 'Different shapes have different area formulas.' },
            { topic: '8.8', type: 'multiple_choice', stem: 'Right triangle with legs $a$ and $b$: area $=$', choices: ['$ab$', '$\\frac{ab}{2}$', '$\\sqrt{a^2+b^2}$', '$a + b$'], correct: 1, explanation: 'Half base times height.' },

            // Topic 8.9: Disc Method (x or y axis)
            { topic: '8.9', type: 'multiple_choice', stem: 'Disc method around x-axis: $V =$', choices: ['$\\int \\pi r\\, dx$', '$\\int \\pi r^2\\, dx$', '$\\int 2\\pi r\\, dx$', '$\\int r^2\\, dx$'], correct: 1, explanation: 'Area of disc is $\\pi r^2$.' },
            { topic: '8.9', type: 'multiple_choice', stem: '$y = x$ from 0 to 2, around x-axis:', choices: ['$\\frac{8\\pi}{3}$', '$4\\pi$', '$2\\pi$', '$\\frac{4\\pi}{3}$'], correct: 0, explanation: '$\\pi\\int_0^2 x^2\\, dx = \\frac{8\\pi}{3}$' },
            { topic: '8.9', type: 'multiple_choice', stem: '$y = \\sqrt{x}$ from 0 to 4, around x-axis:', choices: ['$8\\pi$', '$4\\pi$', '$16\\pi$', '$2\\pi$'], correct: 0, explanation: '$\\pi\\int_0^4 x\\, dx = 8\\pi$' },
            { topic: '8.9', type: 'multiple_choice', stem: 'Around y-axis, use:', choices: ['$\\pi\\int [f(x)]^2\\, dx$', '$\\pi\\int [g(y)]^2\\, dy$', 'Either works', 'Neither'], correct: 1, explanation: 'Express $x$ as function of $y$.' },
            { topic: '8.9', type: 'multiple_choice', stem: '$x = y^2$ from $y = 0$ to $y = 2$, around y-axis:', choices: ['$\\frac{32\\pi}{5}$', '$\\frac{16\\pi}{5}$', '$8\\pi$', '$4\\pi$'], correct: 0, explanation: '$\\pi\\int_0^2 y^4\\, dy = \\frac{32\\pi}{5}$' },
            { topic: '8.9', type: 'multiple_choice', stem: 'Radius in disc method equals:', choices: ['$x$', '$y$', 'Distance to axis', 'Thickness'], correct: 2, explanation: 'Radius = perpendicular distance to axis.' },
            { topic: '8.9', type: 'multiple_choice', stem: '$y = e^x$ from 0 to 1, around x-axis:', choices: ['$\\frac{\\pi(e^2-1)}{2}$', '$\\pi(e-1)$', '$\\pi e^2$', '$\\frac{\\pi}{2}$'], correct: 0, explanation: '$\\pi\\int_0^1 e^{2x}\\, dx$' },
            { topic: '8.9', type: 'multiple_choice', stem: 'Disc method produces solids that are:', choices: ['Hollow', 'Solid', 'Partial', 'Flat'], correct: 1, explanation: 'Full discs, no holes.' },

            // Topic 8.10: Disc Around Other Axes
            { topic: '8.10', type: 'multiple_choice', stem: '$y = x^2$ around $y = -1$. Radius $=$', choices: ['$x^2$', '$x^2 + 1$', '$x^2 - 1$', '$1 - x^2$'], correct: 1, explanation: 'Distance from curve to axis: $x^2 - (-1) = x^2 + 1$' },
            { topic: '8.10', type: 'multiple_choice', stem: '$y = x$ around $y = 4$ (for $x$ from 0 to 4). Radius:', choices: ['$x$', '$4 - x$', '$x - 4$', '$4$'], correct: 1, explanation: 'Distance from $y = x$ to $y = 4$ is $4 - x$.' },
            { topic: '8.10', type: 'multiple_choice', stem: 'Around $x = 2$, region right of y-axis. Radius uses:', choices: ['$x$', '$2 - x$', '$x - 2$', '$|x - 2|$'], correct: 1, explanation: 'Distance from $y$-axis ($x$ values) to $x = 2$.' },
            { topic: '8.10', type: 'multiple_choice', stem: 'Axis above curve means:', choices: ['Subtract axis from curve', 'Subtract curve from axis', 'Add them', 'Use absolute value'], correct: 1, explanation: 'Radius = axis $y$-value minus curve $y$-value.' },
            { topic: '8.10', type: 'multiple_choice', stem: '$y = \\sqrt{x}$ around $y = 3$, from 0 to 4. Radius:', choices: ['$\\sqrt{x}$', '$3 - \\sqrt{x}$', '$\\sqrt{x} - 3$', '$3 + \\sqrt{x}$'], correct: 1, explanation: 'Curve below axis: $3 - \\sqrt{x}$' },
            { topic: '8.10', type: 'multiple_choice', stem: 'Around $x = -1$, $y$-axis region. Radius from curve at $x$:', choices: ['$x$', '$x + 1$', '$-x - 1$', '$1 - x$'], correct: 1, explanation: 'Distance from $x$ to $-1$ is $x - (-1) = x + 1$' },
            { topic: '8.10', type: 'multiple_choice', stem: 'Key to other axes: radius is always:', choices: ['$y$-coordinate', 'Distance to axis', '$x$-coordinate', 'Constant'], correct: 1, explanation: 'Perpendicular distance from curve to axis.' },
            { topic: '8.10', type: 'multiple_choice', stem: '$y = x$, around $y = x + 1$:', choices: ['Radius = 1', 'Radius = $x$', 'Radius = $2x + 1$', 'Radius varies'], correct: 0, explanation: 'Parallel lines: constant distance = 1. (Technically not standard but radius = 1.)' },

            // Topic 8.11: Washer Method (x or y axis)
            { topic: '8.11', type: 'multiple_choice', stem: 'Washer method: $V =$', choices: ['$\\pi\\int (R^2 - r^2)\\, dx$', '$\\pi\\int (R - r)^2\\, dx$', '$\\int (R^2 - r^2)\\, dx$', '$2\\pi\\int (R - r)\\, dx$'], correct: 0, explanation: 'Outer minus inner disc areas.' },
            { topic: '8.11', type: 'multiple_choice', stem: 'Between $y = x$ and $y = x^2$ (0 to 1), around x-axis:', choices: ['$\\frac{2\\pi}{15}$', '$\\frac{\\pi}{6}$', '$\\frac{\\pi}{3}$', '$\\frac{\\pi}{15}$'], correct: 0, explanation: '$\\pi\\int_0^1 (x^2 - x^4)\\, dx = \\frac{2\\pi}{15}$' },
            { topic: '8.11', type: 'multiple_choice', stem: 'Washer has:', choices: ['One radius', 'Two radii', 'Three radii', 'No radius'], correct: 1, explanation: 'Outer radius $R$ and inner radius $r$.' },
            { topic: '8.11', type: 'multiple_choice', stem: 'Outer radius is distance from axis to:', choices: ['Inner curve', 'Outer curve', 'Either curve', 'The origin'], correct: 1, explanation: 'Farther curve from axis.' },
            { topic: '8.11', type: 'multiple_choice', stem: '$y = 4$ and $y = x^2$ from 0 to 2, around x-axis:', choices: ['$\\pi\\int_0^2(16 - x^4)\\, dx$', '$\\pi\\int_0^2(4 - x^2)^2\\, dx$', '$\\pi\\int_0^2(x^4 - 16)\\, dx$', '$\\int_0^2(16 - x^4)\\, dx$'], correct: 0, explanation: '$R = 4$, $r = x^2$; $R^2 - r^2 = 16 - x^4$' },
            { topic: '8.11', type: 'multiple_choice', stem: 'Region between $x = y$ and $x = y^2$ around y-axis:', choices: ['$\\pi\\int(y^2 - y^4)\\, dy$', '$\\pi\\int(y - y^2)^2\\, dy$', '$\\pi\\int(y^4 - y^2)\\, dy$', '$\\int(y^2 - y^4)\\, dy$'], correct: 0, explanation: '$R = y$, $r = y^2$; integrate in $y$.' },
            { topic: '8.11', type: 'multiple_choice', stem: 'If curves don\'t enclose a hole:', choices: ['Use washer anyway', 'Use disc method', 'Cannot compute', 'Set $r = 0$'], correct: 1, explanation: 'No hole means solid disc, not washer.' },
            { topic: '8.11', type: 'multiple_choice', stem: 'Washer vs disc: washer used when:', choices: ['Solid region', 'Region with hole around axis', 'Single curve', 'Axis through region'], correct: 1, explanation: 'Washer handles the hollow center.' },

            // Topic 8.12: Washer Around Other Axes
            { topic: '8.12', type: 'multiple_choice', stem: 'Between $y = x$ and $y = x^2$, around $y = 2$. Outer radius:', choices: ['$2 - x^2$', '$2 - x$', '$x$', '$x^2$'], correct: 0, explanation: 'Distance from $y = 2$ to lower curve $y = x^2$: $2 - x^2$' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Same region, around $y = 2$. Inner radius:', choices: ['$2 - x^2$', '$2 - x$', '$x - 2$', '$x^2 - 2$'], correct: 1, explanation: 'Distance to upper curve $y = x$: $2 - x$' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Around $y = -1$, curves above. Both radii:', choices: ['Subtract $-1$', 'Add 1 to each', 'Use absolute values', 'Stay the same'], correct: 1, explanation: '$R = f(x) - (-1) = f(x) + 1$, similarly for $r$.' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Key check: which curve is farther from axis?', choices: ['Higher $y$ always', 'Lower $y$ always', 'Depends on axis location', 'Doesn\'t matter'], correct: 2, explanation: 'Axis position determines which is outer.' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Around $x = 3$, region to left. Outer radius from $x = 0$:', choices: ['$3$', '$3 - 0 = 3$', '$0 - 3$', '$|3|$'], correct: 0, explanation: 'Distance from $x = 0$ to $x = 3$ is 3.' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Common error: forgetting to:', choices: ['Square the radii', 'Adjust radii for axis', 'Use $\\pi$', 'All of these'], correct: 3, explanation: 'All are common mistakes.' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Around $y = 5$, $y = x$ and $y = x^2$ (0 to 1). $R =$', choices: ['$5 - x^2$', '$5 - x$', '$x$', '$x^2$'], correct: 0, explanation: 'Outer = farther from axis = $5 - x^2$' },
            { topic: '8.12', type: 'multiple_choice', stem: 'Washer formula doesn\'t change, but:', choices: ['Bounds change', 'Radii definitions change', 'Integration variable changes', 'All of these'], correct: 1, explanation: 'Same formula, different $R$ and $r$ expressions.' }
        ];

        function getPuzzlesForTopic(topicId) {
            return puzzles.filter(p => p.topic === topicId);
        }

        function countPuzzlesForTopic(topicId) {
            return getPuzzlesForTopic(topicId).length;
        }

        function getTopicsWithPuzzles() {
            const topics = new Set();
            puzzles.forEach(p => topics.add(p.topic));
            return Array.from(topics).sort();
        }

        return {
            puzzles: puzzles,
            getPuzzlesForTopic: getPuzzlesForTopic,
            countPuzzlesForTopic: countPuzzlesForTopic,
            getTopicsWithPuzzles: getTopicsWithPuzzles
        };
    })();

    // ============================================
    // UI MODULE
    // ============================================
    const UI = (function() {
        let currentPuzzle = null;
        let puzzleQueue = [];

        const introStory = [
            "The storm came without warning...",
            "Your vessel was torn asunder upon the rocks.",
            "You awaken on an unfamiliar shore.",
            "Before you rises an island shrouded in mist—Infinitia.",
            "Eight runes of power guard mathematical secrets.",
            "Master these secrets to find your way home."
        ];

        function init() {
            setupEventListeners();
            updateContinueButton();
        }

        function setupEventListeners() {
            document.getElementById('new-game-btn').addEventListener('click', startNewGame);
            document.getElementById('continue-btn').addEventListener('click', continueGame);
            document.getElementById('skip-intro-btn').addEventListener('click', skipIntro);

            document.querySelectorAll('.map-region').forEach(region => {
                region.addEventListener('click', function() {
                    const regionId = this.dataset.region;
                    if (!this.classList.contains('locked')) {
                        enterRegion(regionId);
                    }
                });
            });

            document.getElementById('open-portal-btn').addEventListener('click', openPortal);
            document.getElementById('back-to-map-btn').addEventListener('click', function() { showScreen('map-screen'); updateMapState(); });
            document.getElementById('back-to-region-btn').addEventListener('click', backToRegion);
            document.getElementById('start-practice-btn').addEventListener('click', startPractice);
            document.getElementById('back-to-lesson-btn').addEventListener('click', backToLesson);
            document.getElementById('submit-numerical-btn').addEventListener('click', submitNumericalAnswer);
            document.getElementById('next-puzzle-btn').addEventListener('click', nextPuzzle);

            document.getElementById('numerical-answer').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') submitNumericalAnswer();
            });

            document.getElementById('claim-rune-btn').addEventListener('click', claimRune);
            document.getElementById('credits-btn').addEventListener('click', function() { showScreen('title-screen'); });
        }

        function updateContinueButton() {
            document.getElementById('continue-btn').disabled = !Game.hasSavedGame();
        }

        function showScreen(screenId, transition) {
            const currentScreen = document.querySelector('.screen.active');
            const nextScreen = document.getElementById(screenId);
            transition = transition || 'fade';

            if (currentScreen === nextScreen) {
                setTimeout(renderMath, 100);
                return;
            }

            // Clear particles on screen change
            Particles.clear();

            // Add transition classes based on type
            if (transition === 'slide-left') {
                nextScreen.classList.add('slide-in-right');
            } else if (transition === 'slide-right') {
                nextScreen.classList.add('slide-in-left');
            } else if (transition === 'zoom-in') {
                nextScreen.classList.add('zoom-in');
            } else if (transition === 'fade-white') {
                document.getElementById('game-container').classList.add('flash-white');
                setTimeout(function() {
                    document.getElementById('game-container').classList.remove('flash-white');
                }, 500);
            }

            // Remove active from all screens
            document.querySelectorAll('.screen').forEach(function(s) {
                s.classList.remove('active');
            });

            // Activate next screen
            nextScreen.classList.add('active');

            // Trigger special effects for specific screens
            if (screenId === 'rune-screen') {
                setTimeout(function() {
                    const runeEl = document.getElementById('rune-symbol');
                    const rect = runeEl.getBoundingClientRect();
                    Particles.spiral(rect.left + rect.width / 2, rect.top + rect.height / 2, 'rune', 2500);
                }, 300);
            }

            // Clean up transition classes after animation
            setTimeout(function() {
                nextScreen.classList.remove('slide-in-right', 'slide-in-left', 'zoom-in');
            }, 500);

            setTimeout(renderMath, 100);
        }

        function renderMath() {
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(document.body, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });
            }
        }

        function startNewGame() {
            Game.newGame();
            showIntro();
        }

        function continueGame() {
            Game.initGame();
            if (Game.hasSeenIntro()) {
                showMap();
            } else {
                showIntro();
            }
        }

        function showIntro() {
            showScreen('intro-screen');
            const container = document.getElementById('intro-text');
            container.innerHTML = '';

            introStory.forEach((line, i) => {
                setTimeout(() => {
                    const p = document.createElement('p');
                    p.textContent = line;
                    p.style.animation = 'fadeInText 1s ease forwards';
                    container.appendChild(p);

                    if (i === introStory.length - 1) {
                        setTimeout(() => {
                            Game.markIntroSeen();
                            showMap();
                        }, 3000);
                    }
                }, i * 2000);
            });
        }

        function skipIntro() {
            Game.markIntroSeen();
            showMap();
        }

        function showMap() {
            updateMapState();
            showScreen('map-screen');
        }

        function updateMapState() {
            document.getElementById('runes-collected').textContent = Game.countRunes();

            document.querySelectorAll('.map-region').forEach(el => {
                const regionId = el.dataset.region;

                if (Game.isRegionAvailable(regionId)) {
                    el.classList.remove('locked');
                    if (Game.hasRune(regionId)) {
                        el.classList.add('completed');
                    } else {
                        el.classList.remove('completed');
                    }
                } else {
                    el.classList.add('locked');
                }
            });

            const portalBtn = document.getElementById('open-portal-btn');
            portalBtn.classList.toggle('hidden', !Game.hasAllRunes());
        }

        function enterRegion(regionId) {
            const region = Locations.getRegion(regionId);
            if (!region) return;

            Game.setCurrentRegion(regionId);

            // Set data-region for CSS animated backgrounds
            document.getElementById('region-screen').dataset.region = regionId;

            document.getElementById('region-title').textContent = region.name;
            document.getElementById('region-description').innerHTML = region.description;

            const topicIds = region.topics.map(t => t.id);
            const mastered = Game.countMasteredTopics(topicIds);
            document.getElementById('topics-mastered').textContent = mastered;
            document.getElementById('topics-total').textContent = region.topics.length;

            const grid = document.getElementById('topics-grid');
            grid.innerHTML = '';

            region.topics.forEach(topic => {
                const card = document.createElement('div');
                card.className = 'topic-card';

                const isMastered = Game.isTopicMastered(topic.id);
                if (isMastered) card.classList.add('mastered');

                const progress = Game.getTopicProgress(topic.id);
                const statusText = isMastered ? 'Mastered' : progress.streak + '/' + Game.MASTERY_THRESHOLD;

                card.innerHTML = '<div class="topic-info"><div class="topic-number">Topic ' + topic.id + '</div><div class="topic-name">' + topic.name + '</div></div><div class="topic-status">' + statusText + '</div>';

                card.addEventListener('click', function() { openTopic(topic.id); });
                grid.appendChild(card);
            });

            showScreen('region-screen', 'zoom-in');
        }

        function backToRegion() {
            const regionId = Game.getCurrentRegion();
            if (regionId) enterRegion(regionId);
            else showMap();
        }

        function openTopic(topicId) {
            const lesson = Lessons.getLesson(topicId);
            Game.setCurrentTopic(topicId);

            document.getElementById('lesson-title').textContent = topicId + ': ' + lesson.title;
            document.getElementById('lesson-content').innerHTML = lesson.content;

            // Initialize any interactive components in the lesson
            setTimeout(function() {
                initAnimatedExamples();
                initLimitVisualizers();
                initDerivativeGraphers();
            }, 150);

            showScreen('lesson-screen', 'slide-left');
        }

        function backToLesson() {
            const topicId = Game.getCurrentTopic();
            if (topicId) openTopic(topicId);
            else backToRegion();
        }

        function startPractice() {
            const topicId = Game.getCurrentTopic();
            if (!topicId) return;

            const puzzles = Puzzles.getPuzzlesForTopic(topicId);
            if (!puzzles || puzzles.length === 0) {
                alert('No puzzles available for this topic yet.');
                return;
            }

            puzzleQueue = shuffleArray(puzzles.slice());

            const lesson = Lessons.getLesson(topicId);
            document.getElementById('puzzle-topic-title').textContent = lesson ? lesson.title : 'Topic ' + topicId;

            updateStreakDisplay();
            showNextPuzzle();
            showScreen('puzzle-screen', 'slide-left');
        }

        function showNextPuzzle() {
            const topicId = Game.getCurrentTopic();
            if (Game.isTopicMastered(topicId)) {
                showMasteryComplete();
                return;
            }

            if (puzzleQueue.length === 0) {
                puzzleQueue = shuffleArray(Puzzles.getPuzzlesForTopic(topicId).slice());
            }

            currentPuzzle = puzzleQueue.shift();
            renderPuzzle(currentPuzzle);
        }

        function renderPuzzle(puzzle) {
            document.getElementById('puzzle-feedback').classList.add('hidden');
            document.getElementById('puzzle-stem').innerHTML = puzzle.stem;

            const choicesContainer = document.getElementById('puzzle-choices');
            const inputArea = document.getElementById('puzzle-input-area');

            // Reset container classes
            choicesContainer.classList.remove('matching-puzzle');

            if (puzzle.type === 'multiple_choice') {
                inputArea.classList.add('hidden');
                choicesContainer.classList.remove('hidden');
                choicesContainer.innerHTML = '';

                puzzle.choices.forEach((choice, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'puzzle-choice';
                    btn.innerHTML = choice;
                    btn.addEventListener('click', function() { selectChoice(idx); });
                    choicesContainer.appendChild(btn);
                });
            } else if (puzzle.type === 'matching') {
                inputArea.classList.add('hidden');
                choicesContainer.classList.remove('hidden');
                renderMatchingPuzzle(puzzle);
                return; // renderMatchingPuzzle calls renderMath
            } else {
                choicesContainer.classList.add('hidden');
                inputArea.classList.remove('hidden');
                document.getElementById('numerical-answer').value = '';
                document.getElementById('numerical-answer').focus();
            }

            renderMath();
        }

        function selectChoice(index) {
            const choices = document.querySelectorAll('.puzzle-choice');
            choices.forEach(c => c.disabled = true);
            choices[index].classList.add('selected');

            const isCorrect = index === currentPuzzle.correct;
            checkAnswer(isCorrect, choices[index], choices[currentPuzzle.correct]);
        }

        function submitNumericalAnswer() {
            const input = document.getElementById('numerical-answer');
            const userAnswer = input.value.trim();
            if (!userAnswer) return;

            const isCorrect = MathModule.validateAnswer(userAnswer, currentPuzzle.answer, currentPuzzle.tolerance);
            checkAnswer(isCorrect);
        }

        function checkAnswer(isCorrect, selectedEl, correctEl) {
            const topicId = Game.getCurrentTopic();
            const result = Game.recordAnswer(topicId, isCorrect);

            if (selectedEl) {
                selectedEl.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (correctEl && !isCorrect) {
                correctEl.classList.add('correct');
            }

            updateStreakDisplay(isCorrect, result);
            showFeedback(isCorrect, result);

            // Trigger visual effects
            if (isCorrect) {
                if (result.justMastered) {
                    // Mastery celebration
                    const rect = document.getElementById('streak-dots').getBoundingClientRect();
                    Particles.celebrationBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
                    triggerMasteryAnimation();
                } else {
                    // Regular correct answer - sparkle from the newest filled dot
                    const dots = document.querySelectorAll('.streak-dot.filled');
                    if (dots.length > 0) {
                        const lastDot = dots[dots.length - 1];
                        const rect = lastDot.getBoundingClientRect();
                        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 'correct', 12);
                    }
                }
            } else {
                // Incorrect - subtle screen shake and fade particles
                triggerScreenShake();
                if (selectedEl) {
                    const rect = selectedEl.getBoundingClientRect();
                    Particles.fadeParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 'incorrect', 8);
                }
            }
        }

        function triggerScreenShake() {
            const container = document.getElementById('puzzle-container');
            container.classList.add('shake-animation');
            setTimeout(function() {
                container.classList.remove('shake-animation');
            }, 200);
        }

        function triggerMasteryAnimation() {
            const dots = document.querySelectorAll('.streak-dot');
            dots.forEach(function(dot, i) {
                setTimeout(function() {
                    dot.classList.add('pulse-animation');
                    setTimeout(function() {
                        dot.classList.remove('pulse-animation');
                    }, 500);
                }, i * 100);
            });
        }

        function showFeedback(isCorrect, result) {
            const feedbackArea = document.getElementById('puzzle-feedback');
            const feedbackResult = document.getElementById('feedback-result');
            const feedbackExplanation = document.getElementById('feedback-explanation');

            feedbackResult.className = isCorrect ? 'correct' : 'incorrect';

            if (result.justMastered) {
                feedbackResult.textContent = 'Topic Mastered!';
            } else if (isCorrect) {
                feedbackResult.textContent = 'Correct!';
            } else {
                feedbackResult.textContent = 'Not quite...';
            }

            feedbackExplanation.innerHTML = currentPuzzle.explanation || '';
            feedbackArea.classList.remove('hidden');

            document.getElementById('next-puzzle-btn').textContent = result.justMastered ? 'Continue' : 'Next Problem';
            renderMath();
        }

        function nextPuzzle() {
            const topicId = Game.getCurrentTopic();

            if (Game.isTopicMastered(topicId)) {
                const regionId = Game.getCurrentRegion();
                const region = Locations.getRegion(regionId);

                if (region) {
                    const topicIds = region.topics.map(t => t.id);
                    if (Game.areAllTopicsMastered(topicIds) && !Game.hasRune(regionId)) {
                        showRuneScreen(regionId);
                        return;
                    }
                }
                backToRegion();
            } else {
                showNextPuzzle();
            }
        }

        function showMasteryComplete() {
            const feedbackArea = document.getElementById('puzzle-feedback');
            document.getElementById('feedback-result').className = 'correct';
            document.getElementById('feedback-result').textContent = 'Already Mastered!';
            document.getElementById('feedback-explanation').innerHTML = 'You have already proven mastery of this topic.';

            document.getElementById('puzzle-stem').innerHTML = '';
            document.getElementById('puzzle-choices').innerHTML = '';
            document.getElementById('puzzle-input-area').classList.add('hidden');

            feedbackArea.classList.remove('hidden');
            document.getElementById('next-puzzle-btn').textContent = 'Return';
        }

        function updateStreakDisplay(isCorrect, result) {
            const topicId = Game.getCurrentTopic();
            const streak = Game.getTopicStreak(topicId);
            const container = document.getElementById('streak-dots');
            const existingDots = container.querySelectorAll('.streak-dot.filled');
            const previousStreak = existingDots ? existingDots.length : 0;
            container.innerHTML = '';

            for (let i = 0; i < Game.MASTERY_THRESHOLD; i++) {
                const dot = document.createElement('div');
                dot.className = 'streak-dot' + (i < streak ? ' filled' : '');

                // Animate newly filled dot (only when isCorrect is explicitly true)
                if (isCorrect === true && i === streak - 1 && i >= previousStreak) {
                    dot.classList.add('fill-animation');
                }

                container.appendChild(dot);
            }
        }

        function showRuneScreen(regionId) {
            const region = Locations.getRegion(regionId);
            if (!region) return;

            document.getElementById('rune-symbol').textContent = region.runeSymbol || '✦';
            document.getElementById('rune-message').textContent = region.runeMessage || 'You have mastered ' + region.name + '.';

            showScreen('rune-screen', 'fade-white');
        }

        function claimRune() {
            const regionId = Game.getCurrentRegion();
            Game.collectRune(regionId);

            if (Game.hasAllRunes()) {
                Game.markGameCompleted();
                showVictory();
            } else {
                showMap();
            }
        }

        function showVictory() {
            const stats = Game.getStats();
            document.getElementById('total-problems-solved').textContent = stats.totalProblemsCorrect;
            document.getElementById('total-topics-mastered').textContent = stats.totalTopicsMastered;
            showScreen('victory-screen');
        }

        function openPortal() {
            if (Game.hasAllRunes()) showVictory();
        }

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        // ============================================
        // ANIMATED STEP-BY-STEP EXAMPLES
        // ============================================
        function initAnimatedExamples() {
            document.querySelectorAll('.animated-example').forEach(function(example) {
                const steps = example.querySelectorAll('.example-step');
                const btn = example.querySelector('.reveal-step-btn');
                if (!btn || steps.length === 0) return;

                let currentStep = 0;

                // Hide all steps initially
                steps.forEach(function(step) {
                    step.classList.add('hidden');
                    step.classList.remove('reveal-animation');
                });

                // Reset button
                btn.textContent = 'Reveal Next Step';
                btn.disabled = false;

                btn.onclick = function() {
                    if (currentStep < steps.length) {
                        steps[currentStep].classList.remove('hidden');
                        steps[currentStep].classList.add('reveal-animation');
                        renderMath();
                        currentStep++;
                    }
                    if (currentStep >= steps.length) {
                        btn.textContent = 'Complete!';
                        btn.disabled = true;
                    }
                };
            });
        }

        // ============================================
        // INTERACTIVE LIMIT VISUALIZER
        // ============================================
        function initLimitVisualizers() {
            document.querySelectorAll('.limit-visualizer').forEach(function(container) {
                const canvas = container.querySelector('canvas');
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                const funcType = container.dataset.function || 'quadratic';
                const limitPoint = parseFloat(container.dataset.limitPoint) || 2;
                const limitValue = parseFloat(container.dataset.limitValue) || 4;

                let isDragging = false;
                let currentX = limitPoint - 1;

                function getFunction(x) {
                    switch (funcType) {
                        case 'quadratic': return x * x;
                        case 'rational': return (x * x - 4) / (x - 2); // removable discontinuity at x=2
                        case 'sine': return Math.sin(x) / x;
                        case 'step': return x < limitPoint ? 1 : 3;
                        default: return x * x;
                    }
                }

                function draw() {
                    const width = canvas.width;
                    const height = canvas.height;
                    const padding = 40;

                    ctx.clearRect(0, 0, width, height);

                    // Draw axes
                    ctx.strokeStyle = '#3a4a5c';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(padding, height - padding);
                    ctx.lineTo(width - padding, height - padding);
                    ctx.moveTo(padding, padding);
                    ctx.lineTo(padding, height - padding);
                    ctx.stroke();

                    // Scale
                    const xScale = (width - 2 * padding) / 6;
                    const yScale = (height - 2 * padding) / 10;

                    // Draw function
                    ctx.strokeStyle = '#4a7c9b';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let px = padding; px < width - padding; px++) {
                        const x = (px - padding) / xScale - 1;
                        if (Math.abs(x - limitPoint) < 0.05 && funcType === 'rational') continue;
                        const y = getFunction(x);
                        const py = height - padding - y * yScale;
                        if (px === padding) {
                            ctx.moveTo(px, py);
                        } else {
                            ctx.lineTo(px, py);
                        }
                    }
                    ctx.stroke();

                    // Draw limit point (hollow circle for discontinuity)
                    if (funcType === 'rational' || funcType === 'step') {
                        const lpx = padding + (limitPoint + 1) * xScale;
                        const lpy = height - padding - limitValue * yScale;
                        ctx.strokeStyle = '#c9a84c';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(lpx, lpy, 6, 0, Math.PI * 2);
                        ctx.stroke();
                    }

                    // Draw draggable point
                    const px = padding + (currentX + 1) * xScale;
                    const py = height - padding - getFunction(currentX) * yScale;

                    // Vertical line to function
                    ctx.strokeStyle = '#9aa5b1';
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(px, height - padding);
                    ctx.lineTo(px, py);
                    ctx.lineTo(padding, py);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Point
                    ctx.fillStyle = '#4a9b6a';
                    ctx.beginPath();
                    ctx.arc(px, py, 8, 0, Math.PI * 2);
                    ctx.fill();

                    // Labels
                    ctx.fillStyle = '#e8dcc4';
                    ctx.font = '14px sans-serif';
                    ctx.fillText('x = ' + currentX.toFixed(3), px + 10, height - padding + 20);
                    ctx.fillText('f(x) = ' + getFunction(currentX).toFixed(3), padding + 10, py - 10);

                    // Limit info
                    ctx.fillStyle = '#c9a84c';
                    ctx.fillText('Approaching x = ' + limitPoint, width / 2 - 50, padding - 10);
                }

                function handleMove(clientX) {
                    const rect = canvas.getBoundingClientRect();
                    const x = clientX - rect.left;
                    const padding = 40;
                    const xScale = (canvas.width - 2 * padding) / 6;
                    currentX = (x - padding) / xScale - 1;

                    // Clamp and avoid exact limit point for discontinuities
                    currentX = Math.max(-0.9, Math.min(4.9, currentX));
                    if (Math.abs(currentX - limitPoint) < 0.01) {
                        currentX = limitPoint - 0.01;
                    }

                    draw();
                }

                canvas.addEventListener('mousedown', function(e) {
                    isDragging = true;
                    handleMove(e.clientX);
                });

                canvas.addEventListener('mousemove', function(e) {
                    if (isDragging) handleMove(e.clientX);
                });

                canvas.addEventListener('mouseup', function() {
                    isDragging = false;
                });

                canvas.addEventListener('mouseleave', function() {
                    isDragging = false;
                });

                // Touch support
                canvas.addEventListener('touchstart', function(e) {
                    isDragging = true;
                    handleMove(e.touches[0].clientX);
                    e.preventDefault();
                });

                canvas.addEventListener('touchmove', function(e) {
                    if (isDragging) {
                        handleMove(e.touches[0].clientX);
                        e.preventDefault();
                    }
                });

                canvas.addEventListener('touchend', function() {
                    isDragging = false;
                });

                draw();
            });
        }

        // ============================================
        // INTERACTIVE DERIVATIVE GRAPHER
        // ============================================
        function initDerivativeGraphers() {
            document.querySelectorAll('.derivative-grapher').forEach(function(container) {
                const canvas = container.querySelector('canvas');
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                const funcType = container.dataset.function || 'cubic';
                const showDerivative = container.dataset.showDerivative === 'true';

                let currentX = 0;
                let isDragging = false;

                function f(x) {
                    switch (funcType) {
                        case 'quadratic': return x * x;
                        case 'cubic': return x * x * x - 3 * x;
                        case 'sine': return Math.sin(x);
                        case 'exp': return Math.exp(x / 2);
                        default: return x * x;
                    }
                }

                function fPrime(x) {
                    switch (funcType) {
                        case 'quadratic': return 2 * x;
                        case 'cubic': return 3 * x * x - 3;
                        case 'sine': return Math.cos(x);
                        case 'exp': return Math.exp(x / 2) / 2;
                        default: return 2 * x;
                    }
                }

                function draw() {
                    const width = canvas.width;
                    const height = canvas.height;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const scale = 40;

                    ctx.clearRect(0, 0, width, height);

                    // Grid
                    ctx.strokeStyle = '#1e2832';
                    ctx.lineWidth = 1;
                    for (let x = 0; x < width; x += scale) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, height);
                        ctx.stroke();
                    }
                    for (let y = 0; y < height; y += scale) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(width, y);
                        ctx.stroke();
                    }

                    // Axes
                    ctx.strokeStyle = '#3a4a5c';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, centerY);
                    ctx.lineTo(width, centerY);
                    ctx.moveTo(centerX, 0);
                    ctx.lineTo(centerX, height);
                    ctx.stroke();

                    // Function f(x)
                    ctx.strokeStyle = '#4a7c9b';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let px = 0; px < width; px++) {
                        const x = (px - centerX) / scale;
                        const y = f(x);
                        const py = centerY - y * scale;
                        if (py > 0 && py < height) {
                            if (px === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                    }
                    ctx.stroke();

                    // Derivative f'(x) if enabled
                    if (showDerivative) {
                        ctx.strokeStyle = '#9b4a4a';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.beginPath();
                        for (let px = 0; px < width; px++) {
                            const x = (px - centerX) / scale;
                            const y = fPrime(x);
                            const py = centerY - y * scale;
                            if (py > 0 && py < height) {
                                if (px === 0) ctx.moveTo(px, py);
                                else ctx.lineTo(px, py);
                            }
                        }
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }

                    // Tangent line at currentX
                    const slope = fPrime(currentX);
                    const yAtX = f(currentX);
                    const px = centerX + currentX * scale;
                    const py = centerY - yAtX * scale;

                    ctx.strokeStyle = '#c9a84c';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    // y - y1 = m(x - x1)
                    const x1 = -5, x2 = 5;
                    const y1 = yAtX + slope * (x1 - currentX);
                    const y2 = yAtX + slope * (x2 - currentX);
                    ctx.moveTo(centerX + x1 * scale, centerY - y1 * scale);
                    ctx.lineTo(centerX + x2 * scale, centerY - y2 * scale);
                    ctx.stroke();

                    // Point on curve
                    ctx.fillStyle = '#4a9b6a';
                    ctx.beginPath();
                    ctx.arc(px, py, 8, 0, Math.PI * 2);
                    ctx.fill();

                    // Info
                    ctx.fillStyle = '#e8dcc4';
                    ctx.font = '14px sans-serif';
                    ctx.fillText('x = ' + currentX.toFixed(2), 10, 20);
                    ctx.fillText('f(x) = ' + yAtX.toFixed(2), 10, 40);
                    ctx.fillStyle = '#c9a84c';
                    ctx.fillText('Slope = ' + slope.toFixed(2), 10, 60);
                }

                function handleMove(clientX) {
                    const rect = canvas.getBoundingClientRect();
                    const x = clientX - rect.left;
                    const centerX = canvas.width / 2;
                    const scale = 40;
                    currentX = (x - centerX) / scale;
                    currentX = Math.max(-4, Math.min(4, currentX));
                    draw();
                }

                canvas.addEventListener('mousedown', function(e) {
                    isDragging = true;
                    handleMove(e.clientX);
                });

                canvas.addEventListener('mousemove', function(e) {
                    if (isDragging) handleMove(e.clientX);
                });

                canvas.addEventListener('mouseup', function() { isDragging = false; });
                canvas.addEventListener('mouseleave', function() { isDragging = false; });

                // Touch support
                canvas.addEventListener('touchstart', function(e) {
                    isDragging = true;
                    handleMove(e.touches[0].clientX);
                    e.preventDefault();
                });

                canvas.addEventListener('touchmove', function(e) {
                    if (isDragging) {
                        handleMove(e.touches[0].clientX);
                        e.preventDefault();
                    }
                });

                canvas.addEventListener('touchend', function() { isDragging = false; });

                // Toggle derivative button
                const toggleBtn = container.querySelector('.toggle-derivative-btn');
                if (toggleBtn) {
                    toggleBtn.onclick = function() {
                        container.dataset.showDerivative = container.dataset.showDerivative === 'true' ? 'false' : 'true';
                        draw();
                    };
                }

                draw();
            });
        }

        // ============================================
        // MATCHING PUZZLE TYPE
        // ============================================
        function renderMatchingPuzzle(puzzle) {
            const container = document.getElementById('puzzle-choices');
            container.innerHTML = '';
            container.classList.add('matching-puzzle');

            const leftColumn = document.createElement('div');
            leftColumn.className = 'matching-left';
            const rightColumn = document.createElement('div');
            rightColumn.className = 'matching-right';

            const pairs = puzzle.pairs.slice();
            const shuffledRight = shuffleArray(pairs.map(function(p, i) { return { text: p.right, index: i }; }));

            let selectedLeft = null;
            let matches = {};
            let matchCount = 0;

            pairs.forEach(function(pair, i) {
                const leftItem = document.createElement('div');
                leftItem.className = 'matching-item matching-item-left';
                leftItem.innerHTML = pair.left;
                leftItem.dataset.index = i;

                leftItem.onclick = function() {
                    if (matches[i] !== undefined) return;
                    document.querySelectorAll('.matching-item-left').forEach(function(el) {
                        el.classList.remove('selected');
                    });
                    leftItem.classList.add('selected');
                    selectedLeft = i;
                };

                leftColumn.appendChild(leftItem);
            });

            shuffledRight.forEach(function(item) {
                const rightItem = document.createElement('div');
                rightItem.className = 'matching-item matching-item-right';
                rightItem.innerHTML = item.text;
                rightItem.dataset.correctIndex = item.index;

                rightItem.onclick = function() {
                    if (selectedLeft === null) return;
                    if (rightItem.classList.contains('matched')) return;

                    const isCorrect = selectedLeft === item.index;

                    if (isCorrect) {
                        matches[selectedLeft] = item.index;
                        matchCount++;

                        document.querySelector('.matching-item-left[data-index="' + selectedLeft + '"]').classList.add('matched', 'correct');
                        rightItem.classList.add('matched', 'correct');

                        // Particle burst
                        const rect = rightItem.getBoundingClientRect();
                        Particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 'correct', 10);

                        if (matchCount === pairs.length) {
                            // All matched - record as correct
                            setTimeout(function() {
                                checkAnswer(true);
                            }, 500);
                        }
                    } else {
                        rightItem.classList.add('incorrect');
                        document.querySelector('.matching-item-left[data-index="' + selectedLeft + '"]').classList.add('incorrect');
                        setTimeout(function() {
                            rightItem.classList.remove('incorrect');
                            document.querySelector('.matching-item-left[data-index="' + selectedLeft + '"]').classList.remove('incorrect');
                        }, 500);
                    }

                    document.querySelectorAll('.matching-item-left').forEach(function(el) {
                        el.classList.remove('selected');
                    });
                    selectedLeft = null;
                };

                rightColumn.appendChild(rightItem);
            });

            container.appendChild(leftColumn);
            container.appendChild(rightColumn);
            renderMath();
        }

        return {
            init: init,
            showScreen: showScreen,
            showMap: showMap,
            initAnimatedExamples: initAnimatedExamples,
            initLimitVisualizers: initLimitVisualizers,
            initDerivativeGraphers: initDerivativeGraphers,
            renderMatchingPuzzle: renderMatchingPuzzle
        };
    })();

    // ============================================
    // INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('The Island of Infinitia - Initializing...');
        Particles.init();
        Game.initGame();
        UI.init();
        UI.showScreen('title-screen');

        // Log puzzle counts
        var topics = Puzzles.getTopicsWithPuzzles();
        console.log('Puzzles loaded for ' + topics.length + ' topics');

        console.log('Game ready!');
    });

    // Debug tools
    window.InfinitiaDebug = {
        Game: Game,
        Locations: Locations,
        Lessons: Lessons,
        Puzzles: Puzzles,
        Particles: Particles,
        UI: UI,
        resetGame: function() {
            Game.clearSave();
            location.reload();
        },
        grantAllRunes: function() {
            Locations.getRegionIds().forEach(function(id) {
                Game.collectRune(id);
            });
            console.log('All runes granted!');
        },
        testParticles: function(type) {
            type = type || 'correct';
            var x = window.innerWidth / 2;
            var y = window.innerHeight / 2;
            if (type === 'celebration') {
                Particles.celebrationBurst(x, y);
            } else if (type === 'spiral') {
                Particles.spiral(x, y, 'rune');
            } else {
                Particles.burst(x, y, type, 30);
            }
        }
    };

})();
