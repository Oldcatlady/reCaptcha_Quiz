/* ========================================
   QUIZ SCRIPT – Haupt-Steuerungsdatei
   ======================================== */


/* ========================================
   GLOBALE VARIABLEN
   ======================================== */

let allQuestions = [];
let questions = [];

let current = 0;
let correct = 0;
let wrong = 0;

let answered = false;

// Für Fragen mit mehreren richtigen Antworten
let selectedAnswers = new Set();

let selectedTheme = "girl_power";

// Speichert beantwortete Fragen
let history = [];


/* ========================================
   THEME HANDLING
   ======================================== */

function previewTheme(theme) {

    selectedTheme = theme;

    document.body.className =
        theme === "girl_power" ? "" : theme;

    document.querySelectorAll(".theme-btn").forEach(btn => {

        btn.classList.toggle(
            "active-theme",
            btn.dataset.theme === theme
        );

    });

    const preview =
        document.getElementById("themePreview");

    if (preview) {
        preview.classList.add("visible");
    }
}


/* ========================================
   SEITEN-NAVIGATION
   ======================================== */

function showPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove("active")
        );

    const target =
        document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }
}


function goToStart() {

    showPage("startPage");

}


/* ========================================
   QUIZ STARTEN
   ======================================== */

function startQuiz() {

    document.body.className =
        selectedTheme === "girl_power"
            ? ""
            : selectedTheme;

    current = 0;

    correct = 0;
    wrong = 0;

    answered = false;

    selectedAnswers = new Set();

    history = [];

    showPage("quizPage");

    loadQuestion();
}


/* ========================================
   FRAGEN LADEN
   ======================================== */

function loadQuestion() {

    if (current >= questions.length) {

        showResult();

        return;
    }


    const q =
        questions[current];

    const savedState =
        history[current];


    const questionElement =
        document.getElementById("question");

    if (questionElement) {

        questionElement.innerText =
            cleanQuestionText(q.question);

    }


    const feedback =
        document.getElementById("feedback");

    if (feedback) {

        feedback.className = "";

        feedback.innerHTML = "";

        feedback.style.display = "none";

    }


    const textAnswer =
        document.getElementById("textAnswer");

    if (textAnswer) {

        textAnswer.value = "";

        textAnswer.disabled = false;

    }


    clearAnswerButtons();


    const answers =
        document.getElementById("answers");

    if (answers) {
        answers.innerHTML = "";
    }


    if (savedState) {

        answered = true;

        renderQuestionWithState(
            q,
            savedState
        );

    } else {

        answered = false;

        renderQuestion(q);

    }


    updateProgress();

    updateNavButtons();
}


/* ========================================
   FRAGE DARSTELLEN
   ======================================== */

function renderQuestion(q) {

    const answersDiv =
        document.getElementById("answers");

    if (!answersDiv) return;


    selectedAnswers =
        new Set();


    /* ----------------------------------------
       OPTIONEN ALS ARRAY
       ---------------------------------------- */

    if (
        q.options &&
        Array.isArray(q.options)
    ) {

        if (
            q.type === "mc" ||
            !q.type
        ) {

            const correctAnswers =
                getCorrectAnswers(q);


            q.options.forEach(opt => {

                const btn =
                    document.createElement("button");

                const key =
                    opt
                        .trim()
                        .charAt(0)
                        .toUpperCase();


                btn.innerText =
                    opt;

                btn.className =
                    "answer-btn";


                btn.onclick = () => {

                    /*
                     Eine richtige Antwort:
                     sofort auswerten
                    */

                    if (
                        correctAnswers.length === 1
                    ) {

                        checkAnswer([key]);

                        return;
                    }


                    /*
                     Mehrere richtige Antworten:
                     markieren / abwählen
                    */

                    toggleSelectedAnswer(
                        key,
                        btn
                    );

                };


                answersDiv.appendChild(btn);

            });


            const textAnswer =
                document.getElementById(
                    "textAnswer"
                );

            if (textAnswer) {
                textAnswer.style.display =
                    "none";
            }

        }


        /* ----------------------------------------
           COPY-FRAGE
           ---------------------------------------- */

        else if (
            q.type === "copy"
        ) {

            q.options.forEach(opt => {

                const btn =
                    document.createElement(
                        "button"
                    );

                btn.innerText = opt;

                btn.className =
                    "answer-btn";


                btn.onclick = () => {

                    const input =
                        document.getElementById(
                            "textAnswer"
                        );

                    if (input) {
                        input.value = opt;
                    }

                    checkAnswer(opt);

                };


                answersDiv.appendChild(btn);

            });


            const input =
                document.getElementById(
                    "textAnswer"
                );

            if (input) {
                input.style.display =
                    "block";
            }

        }

    }


    /* ----------------------------------------
       OPTIONEN ALS OBJEKT
       {"A":"...", "B":"..."}
       ---------------------------------------- */

    else if (
        q.options &&
        typeof q.options === "object"
    ) {

        const correctAnswers =
            getCorrectAnswers(q);


        Object.keys(q.options)
            .forEach(key => {

                const btn =
                    document.createElement(
                        "button"
                    );


                btn.innerText =
                    `${key}: ${q.options[key]}`;

                btn.className =
                    "answer-btn";


                btn.setAttribute(
                    "aria-pressed",
                    "false"
                );


                btn.onclick = () => {

                    /*
                     Alte Fragen mit nur
                     einer richtigen Antwort:
                    */

                    if (
                        correctAnswers.length === 1
                    ) {

                        checkAnswer([key]);

                        return;
                    }


                    /*
                     Mehrfachauswahl
                    */

                    toggleSelectedAnswer(
                        key,
                        btn
                    );

                };


                answersDiv.appendChild(btn);

            });


        const textAnswer =
            document.getElementById(
                "textAnswer"
            );

        if (textAnswer) {
            textAnswer.style.display =
                "none";
        }

    }


    /* ----------------------------------------
       REINE TEXTFRAGE
       ---------------------------------------- */

    if (
        q.type === "text"
    ) {

        const input =
            document.getElementById(
                "textAnswer"
            );

        if (input) {
            input.style.display =
                "block";
        }

    }

}


/* ========================================
   BEANTWORTETE FRAGE DARSTELLEN
   ======================================== */

function renderQuestionWithState(
    q,
    state
) {

    const answersDiv =
        document.getElementById("answers");

    if (!answersDiv) return;


    const tag =
        document.createElement("div");

    tag.className =
        "reviewed-tag";

    tag.innerText =
        state.wasCorrect
            ? "✔ Richtig beantwortet"
            : "✖ Falsch beantwortet";

    answersDiv.appendChild(tag);


    /*
     Richtige Antworten immer
     als Array behandeln.
    */

    const correctAnswers =
        getCorrectAnswers(q);


    const userAnswers =
        Array.isArray(state.userAnswer)

            ? state.userAnswer.map(
                answer =>
                    String(answer)
                        .trim()
                        .toUpperCase()
            )

            : [
                String(
                    state.userAnswer || ""
                )
                    .trim()
                    .toUpperCase()
            ];


    /* ----------------------------------------
       ARRAY-OPTIONEN
       ---------------------------------------- */

    if (
        q.options &&
        Array.isArray(q.options)
    ) {

        if (
            q.type === "mc" ||
            !q.type
        ) {

            q.options.forEach(opt => {

                const letter =
                    opt
                        .trim()
                        .charAt(0)
                        .toUpperCase();


                const btn =
                    document.createElement(
                        "button"
                    );

                btn.innerText = opt;

                btn.className =
                    "answer-btn";

                btn.disabled = true;


                /*
                 Richtige Antworten:
                 grün
                */

                if (
                    correctAnswers.includes(
                        letter
                    )
                ) {

                    btn.classList.add(
                        "btn-correct"
                    );

                    btn.style.opacity = "1";

                }


                /*
                 Falsch ausgewählte:
                 rot
                */

                else if (
                    userAnswers.includes(
                        letter
                    )
                ) {

                    btn.classList.add(
                        "btn-wrong"
                    );

                    btn.style.opacity = "1";

                }


                else {

                    btn.style.opacity =
                        "0.45";

                }


                answersDiv.appendChild(btn);

            });


            const input =
                document.getElementById(
                    "textAnswer"
                );

            if (input) {
                input.style.display =
                    "none";
            }

        }


        /* ----------------------------------------
           COPY
           ---------------------------------------- */

        else if (
            q.type === "copy"
        ) {

            const input =
                document.getElementById(
                    "textAnswer"
                );

            if (input) {

                input.style.display =
                    "block";

                input.value =
                    state.userAnswer;

                input.disabled = true;

            }


            const correctText =
                String(
                    q.correct ||
                    q.answer ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            q.options.forEach(opt => {

                const btn =
                    document.createElement(
                        "button"
                    );

                btn.innerText = opt;

                btn.className =
                    "answer-btn";

                btn.disabled = true;


                if (
                    opt
                        .toLowerCase() ===
                    correctText
                ) {

                    btn.classList.add(
                        "btn-correct"
                    );

                    btn.style.opacity = "1";

                }

                else {

                    btn.style.opacity =
                        "0.45";

                }


                answersDiv.appendChild(btn);

            });

        }

    }


    /* ----------------------------------------
       OBJEKT-OPTIONEN
       ---------------------------------------- */

    else if (
        q.options &&
        typeof q.options === "object"
    ) {

        Object
            .keys(q.options)
            .forEach(key => {

                const normalizedKey =
                    key.toUpperCase();


                const btn =
                    document.createElement(
                        "button"
                    );


                btn.innerText =
                    `${key}: ${q.options[key]}`;

                btn.className =
                    "answer-btn";

                btn.disabled = true;


                /*
                 Alle richtigen Antworten:
                 grün
                */

                if (
                    correctAnswers.includes(
                        normalizedKey
                    )
                ) {

                    btn.classList.add(
                        "btn-correct"
                    );

                    btn.style.opacity =
                        "1";

                }


                /*
                 Falsch angeklickte Antworten:
                 rot
                */

                else if (
                    userAnswers.includes(
                        normalizedKey
                    )
                ) {

                    btn.classList.add(
                        "btn-wrong"
                    );

                    btn.style.opacity =
                        "1";

                }


                else {

                    btn.style.opacity =
                        "0.45";

                }


                answersDiv.appendChild(btn);

            });


        const input =
            document.getElementById(
                "textAnswer"
            );

        if (input) {
            input.style.display =
                "none";
        }

    }


    /* ----------------------------------------
       TEXTFRAGE
       ---------------------------------------- */

    if (
        q.type === "text"
    ) {

        const input =
            document.getElementById(
                "textAnswer"
            );

        if (input) {

            input.style.display =
                "block";

            input.value =
                state.userAnswer;

            input.disabled =
                true;

        }

    }


    /* ----------------------------------------
       FEEDBACK
       ---------------------------------------- */

    const feedback =
        document.getElementById(
            "feedback"
        );


    const solution =
        (
            q.type === "text" ||
            q.type === "copy"
        )

            ? (
                q.correct ||
                q.answer ||
                ""
            )

            : correctAnswers.join(", ");


    if (feedback) {

        if (
            state.wasCorrect
        ) {

            feedback.className =
                "correct";


            feedback.innerHTML =
                `<b>Richtig!</b><br>
                ${q.explanation || ""}
                <br><br>
                <b>Antwort:</b>
                ${solution}`;

        }

        else {

            feedback.className =
                "wrong";


            feedback.innerHTML =
                `<b>Falsch!</b><br>
                Richtige Antwort:<br>
                <b>${solution}</b>
                <br><br>
                ${q.explanation || ""}`;

        }

    }

}


/* ========================================
   ANTWORT PRÜFEN
   ======================================== */

function checkAnswer(value) {

    /*
     Verhindert doppeltes
     Beantworten.
    */

    if (answered) return;


    const q =
        questions[current];


    const feedback =
        document.getElementById(
            "feedback"
        );


    let wasCorrect =
        false;


    let userAnswers =
        [];


    let correctAnswers =
        [];


    /* ----------------------------------------
       TEXT / COPY
       ---------------------------------------- */

    if (
        q.type === "text" ||
        q.type === "copy"
    ) {

        const userAnswer =
            String(value ?? "")
                .trim()
                .toLowerCase();


        const correctAnswer =
            String(
                q.correct ||
                q.answer ||
                ""
            )
                .trim()
                .toLowerCase();


        wasCorrect =
            userAnswer ===
            correctAnswer;

    }


    /* ----------------------------------------
       MULTIPLE CHOICE
       ---------------------------------------- */

    else {

        correctAnswers =
            getCorrectAnswers(q);


        userAnswers =
            Array.isArray(value)

                ? value.map(
                    answer =>
                        String(answer)
                            .trim()
                            .toUpperCase()
                )

                : [
                    String(value ?? "")
                        .trim()
                        .toUpperCase()
                ];


        /*
         Die Antwort ist nur richtig,
         wenn genau dieselben Antworten
         ausgewählt wurden.
        */

        wasCorrect =
            sameAnswers(
                userAnswers,
                correctAnswers
            );

    }


    answered = true;


    /* ----------------------------------------
       BUTTONS AUSWERTEN
       ---------------------------------------- */

    document
        .querySelectorAll(
            ".answer-btn"
        )
        .forEach(btn => {

            btn.disabled =
                true;

            btn.style.opacity =
                "0.45";

            btn.style.outline =
                "";


            if (
                q.type === "text" ||
                q.type === "copy"
            ) {

                return;
            }


            const letter =
                btn
                    .innerText
                    .trim()
                    .charAt(0)
                    .toUpperCase();


            /*
             Richtige Antworten:
             grün
            */

            if (
                correctAnswers.includes(
                    letter
                )
            ) {

                btn.classList.add(
                    "btn-correct"
                );

                btn.style.opacity =
                    "1";

            }


            /*
             Ausgewählt aber falsch:
             rot
            */

            else if (
                userAnswers.includes(
                    letter
                )
            ) {

                btn.classList.add(
                    "btn-wrong"
                );

                btn.style.opacity =
                    "1";

            }

        });


    /* ----------------------------------------
       LÖSUNGSTEXT
       ---------------------------------------- */

    const solution =
        (
            q.type === "text" ||
            q.type === "copy"
        )

            ? (
                q.correct ||
                q.answer ||
                ""
            )

            : correctAnswers.join(", ");


    /* ----------------------------------------
       PUNKTE
       ---------------------------------------- */

    if (wasCorrect) {

        correct++;


        if (feedback) {

            feedback.className =
                "correct";


            feedback.innerHTML =
                `<b>Richtig!</b><br>
                ${q.explanation || ""}
                <br><br>
                <b>Antwort:</b>
                ${solution}`;

        }

    }

    else {

        wrong++;


        if (feedback) {

            feedback.className =
                "wrong";


            feedback.innerHTML =
                `<b>Falsch!</b><br>
                Richtige Antwort:<br>
                <b>${solution}</b>
                <br><br>
                ${q.explanation || ""}`;

        }

    }


    if (feedback) {

        feedback.style.display =
            "block";

    }


    /* ----------------------------------------
       HISTORY SPEICHERN
       ---------------------------------------- */

    history[current] = {

        answered: true,

        userAnswer:
            (
                q.type === "text" ||
                q.type === "copy"
            )

                ? value

                : userAnswers,

        wasCorrect:
            wasCorrect

    };


    updateProgress();

    updateNavButtons();
}


/* ========================================
   NAVIGATION
   ======================================== */

function nextQuestion() {

    const q =
        questions[current];


    /*
     Wenn die aktuelle Frage
     noch nicht ausgewertet wurde.
    */

    if (!answered) {


        /* ----------------------------------------
           TEXT / COPY
           ---------------------------------------- */

        if (
            q.type === "text" ||
            q.type === "copy"
        ) {

            const input =
                document.getElementById(
                    "textAnswer"
                );


            const value =
                input
                    ? input.value
                    : "";


            if (
                !value.trim()
            ) {

                const feedback =
                    document.getElementById(
                        "feedback"
                    );


                if (feedback) {

                    feedback.className =
                        "wrong";


                    feedback.innerHTML =
                        "Bitte gib zuerst eine Antwort ein.";

                }


                return;
            }


            checkAnswer(value);

            return;
        }


        /* ----------------------------------------
           MC / MEHRFACHAUSWAHL
           ---------------------------------------- */

        const correctAnswers =
            getCorrectAnswers(q);


        /*
         Bei mehreren richtigen Antworten
         dient der Weiter-Button zum
         Abschicken der Auswahl.
        */

        if (
            correctAnswers.length > 1
        ) {

            if (
                selectedAnswers.size === 0
            ) {

                const feedback =
                    document.getElementById(
                        "feedback"
                    );


                if (feedback) {

                    feedback.className =
                        "wrong";


                    feedback.innerHTML =
                        "Bitte wähle mindestens eine Antwort aus.";

                }


                return;
            }


            checkAnswer(
                [...selectedAnswers]
            );


            return;
        }


        /*
         Bei Einzelfragen wird bereits
         beim Klick ausgewertet.
        */

        const feedback =
            document.getElementById(
                "feedback"
            );


        if (feedback) {

            feedback.className =
                "wrong";


            feedback.innerHTML =
                "Bitte wähle zuerst eine Antwort aus.";

        }


        return;
    }


    /* ----------------------------------------
       NÄCHSTE FRAGE
       ---------------------------------------- */

    current++;


    if (
        current <
        questions.length
    ) {

        loadQuestion();

    }

    else {

        showResult();

    }

}


/* ========================================
   ZURÜCK
   ======================================== */

function prevQuestion() {

    if (
        current > 0
    ) {

        current--;

        loadQuestion();

    }

}


/* ========================================
   NAVIGATIONSBUTTONS
   ======================================== */

function updateNavButtons() {

    const prevBtn =
        document.getElementById(
            "prevBtn"
        );


    const nextBtn =
        document.getElementById(
            "nextBtn"
        );


    if (prevBtn) {

        prevBtn.style.display =
            (
                current > 0 &&
                history[current - 1]
            )

                ? "block"

                : "none";

    }


    if (nextBtn) {

        nextBtn.style.display =
            "block";


        if (
            current >=
                questions.length - 1 &&
            answered
        ) {

            nextBtn.innerText =
                "Auswertung →";

        }

        else {

            nextBtn.innerText =
                "Weiter →";

        }

    }

}


/* ========================================
   FORTSCHRITT
   ======================================== */

function updateProgress() {

    if (
        current >=
        questions.length
    ) {

        return;
    }


    /*
     Anzahl bereits
     beantworteter Fragen.
    */

    const answeredCount =
        history.filter(
            entry => entry != null
        ).length;


    const progressText =
        document.getElementById(
            "progressText"
        );


    if (progressText) {

        progressText.innerText =
            `Frage ${current + 1} / ${questions.length}`;

    }


    const scoreText =
        document.getElementById(
            "scoreText"
        );


    if (scoreText) {

        scoreText.innerText =
            `✔ ${correct} | ✖ ${wrong}`;

    }


    const percentText =
        document.getElementById(
            "percentText"
        );


    if (percentText) {

        percentText.innerText =
            answeredCount > 0

                ? `(${Math.round(
                    (
                        correct /
                        answeredCount
                    ) * 100
                )}%)`

                : "";

    }


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            (
                (
                    current + 1
                ) /
                questions.length
            ) *
            100 +
            "%";

    }

}


/* ========================================
   ERGEBNIS
   ======================================== */

function showResult() {

    const total =
        questions.length;


    const percent =
        total > 0

            ? (
                correct /
                total
            ) * 100

            : 0;


    const grade =
        getGrade(percent);


    const gradeLabel =
        grade <= 2

            ? "🎉"

            : grade <= 4

                ? "👍"

                : "📚";


    const resultContent =
        document.getElementById(
            "resultContent"
        );


    if (resultContent) {

        resultContent.innerHTML = `

            <div class="grade-badge">
                ${grade}
            </div>

            <p style="
                color:var(--text-muted);
                font-size:0.85rem;
                margin-bottom:16px;
            ">
                IHK-Note
                (1 = beste)
            </p>

            <p style="
                font-size:1.1rem;
                margin-bottom:6px;
            ">
                ${gradeLabel}
                ${percent.toFixed(1)}%
                erreicht
            </p>

            <p style="
                color:var(--text-muted);
                margin-bottom:4px;
            ">
                ✔ ${correct} richtige
                &nbsp;|&nbsp;
                ✖ ${wrong} falsche Antworten
            </p>

            <p style="
                color:var(--text-muted);
                font-size:0.85rem;
            ">
                von ${total} Fragen
            </p>

        `;

    }


    showPage(
        "resultPage"
    );

}


/* ========================================
   IHK-NOTENSCHLÜSSEL
   ======================================== */

function getGrade(p) {

    if (p >= 92) return 1;

    if (p >= 81) return 2;

    if (p >= 67) return 3;

    if (p >= 50) return 4;

    if (p >= 30) return 5;

    return 6;

}


/* ========================================
   SHUFFLE
   ======================================== */

function shuffleArray(arr) {

    for (
        let i =
            arr.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            arr[i],
            arr[j]
        ] = [
            arr[j],
            arr[i]
        ];

    }


    return arr;

}


/* ========================================
   QUIZ MISCHEN UND NEU STARTEN
   ======================================== */

function shuffleAndRestart() {

    questions =
        shuffleArray(
            [...allQuestions]
        );


    current = 0;

    correct = 0;

    wrong = 0;

    answered = false;

    selectedAnswers =
        new Set();

    history = [];


    showPage(
        "quizPage"
    );


    loadQuestion();

}


/* ========================================
   HELPER:
   KORREKTE ANTWORTEN HOLEN
   ======================================== */

function getCorrectAnswers(q) {

    /*
     Unterstützt:

     "correct": "B"

     UND

     "correct": ["A","C","D"]

     Zusätzlich würde sogar
     "correct": "A, C, D"
     funktionieren.
    */

    const raw =
        q.correct ??
        q.answer ??
        "";


    if (
        Array.isArray(raw)
    ) {

        return raw

            .map(
                answer =>
                    String(answer)
                        .trim()
                        .toUpperCase()
            )

            .filter(Boolean);

    }


    return String(raw)

        .split(",")

        .map(
            answer =>
                answer
                    .trim()
                    .toUpperCase()
        )

        .filter(Boolean);

}


/* ========================================
   HELPER:
   ANTWORTMENGEN VERGLEICHEN
   ======================================== */

function sameAnswers(
    userAnswers,
    correctAnswers
) {

    /*
     Unterschiedliche Anzahl?
     Dann automatisch falsch.
    */

    if (
        userAnswers.length !==
        correctAnswers.length
    ) {

        return false;

    }


    /*
     Reihenfolge spielt keine Rolle.
    */

    const userSorted =
        [...userAnswers]
            .sort();


    const correctSorted =
        [...correctAnswers]
            .sort();


    return userSorted.every(
        (
            answer,
            index
        ) =>
            answer ===
            correctSorted[index]
    );

}


/* ========================================
   HELPER:
   MEHRFACHAUSWAHL
   ======================================== */

function toggleSelectedAnswer(
    key,
    btn
) {

    key =
        String(key)
            .trim()
            .toUpperCase();


    /*
     Bereits ausgewählt:
     wieder abwählen.
    */

    if (
        selectedAnswers.has(key)
    ) {

        selectedAnswers.delete(key);


        btn.style.outline =
            "";


        btn.setAttribute(
            "aria-pressed",
            "false"
        );

    }


    /*
     Noch nicht ausgewählt:
     markieren.
    */

    else {

        selectedAnswers.add(key);


        /*
         Sichtbare Markierung,
         ohne zusätzliche CSS-Datei
         ändern zu müssen.
        */

        btn.style.outline =
            "3px solid currentColor";


        btn.setAttribute(
            "aria-pressed",
            "true"
        );

    }

}


/* ========================================
   FRAGETEXT BEREINIGEN
   ======================================== */

function cleanQuestionText(text) {

    if (!text) {

        return "";

    }


    return text

        .split("\nA)")[0]

        .split("\nAntwort:")[0]

        .split("\nErklärung:")[0]

        .trim();

}


/* ========================================
   ANTWORTBUTTONS ENTFERNEN
   ======================================== */

function clearAnswerButtons() {

    document
        .querySelectorAll(
            ".answer-btn"
        )
        .forEach(
            btn =>
                btn.remove()
        );

}


/* ========================================
   ENTER-TASTE FÜR TEXTFRAGEN
   ======================================== */

const textAnswerElement =
    document.getElementById(
        "textAnswer"
    );


if (textAnswerElement) {

    textAnswerElement
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    const value =
                        event.target.value;


                    if (
                        value.trim()
                    ) {

                        checkAnswer(
                            value
                        );

                    }

                }

            }
        );

}


/* ========================================
   FRAGEN AUS JSON LADEN
   ======================================== */

fetch("questions.json")

    .then(
        response =>
            response.json()
    )

    .then(data => {

        allQuestions =
            data;


        questions =
            [...allQuestions];


        showPage(
            "startPage"
        );


        const defaultBtn =
            document.querySelector(
                '[data-theme="girl_power"]'
            );


        if (defaultBtn) {

            defaultBtn.classList.add(
                "active-theme"
            );

        }

    })

    .catch(error => {

        console.error(
            "Fehler beim Laden der Fragen:",
            error
        );


        document.body.innerHTML =

            "<p style='color:red;padding:20px;'>" +

            "Fehler: questions.json konnte nicht geladen werden." +

            "</p>";

    });


/* ========================================
   TOTENKOPF-STEUERUNG
   ======================================== */

const skull =
    document.getElementById(
        "skull"
    );


const humanEyes =
    document.querySelectorAll(
        ".human-eye"
    );


const irises =
    document.querySelectorAll(
        ".iris"
    );


const toggleBtn =

    document.getElementById(
        "skullToggleBtn"
    )

    ||

    document.getElementById(
        "lizardToggleBtn"
    );


let skullActive =
    true;


let isLaunching =
    false;


/* ----------------------------------------
   Startposition
   ---------------------------------------- */

let sPosX =
    window.innerWidth / 2;


let sPosY =
    window.innerHeight / 2;


/* ----------------------------------------
   Mausposition
   ---------------------------------------- */

let mouseX =
    window.innerWidth / 2;


let mouseY =
    window.innerHeight / 2;


let sAngle =
    0;


let eyeTimer =
    0;


let eyesAreVisible =
    false;


let orbitAngle =
    0;


/* ========================================
   MAUSPOSITION AKTUALISIEREN
   ======================================== */

window.addEventListener(
    "mousemove",
    event => {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;

    }
);


/* ========================================
   TOTENKOPF EIN / AUS
   ======================================== */

if (toggleBtn) {

    toggleBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            skullActive =
                !skullActive;


            if (!skullActive) {

                toggleBtn.innerText =
                    "💀 Ein";


                toggleBtn.classList.add(
                    "disabled"
                );


                if (skull) {

                    skull.classList.add(
                        "skull-hidden"
                    );

                }

            }

            else {

                toggleBtn.innerText =
                    "💀 Aus";


                toggleBtn.classList.remove(
                    "disabled"
                );


                if (skull) {

                    skull.classList.remove(
                        "skull-hidden"
                    );

                }


                sPosX =
                    mouseX;

                sPosY =
                    mouseY;

                sAngle =
                    0;

            }

        }
    );

}


/* ========================================
   TOTENKOPF SICHTBAR MACHEN
   ======================================== */

if (skull) {

    skull.classList.remove(
        "skull-hidden"
    );

}


/* ========================================
   TOTENKOPF ANKLICKEN
   ======================================== */

if (skull) {

    skull.addEventListener(
        "click",
        () => {

            if (
                isLaunching ||
                !skullActive
            ) {

                return;
            }


            isLaunching =
                true;


            skull.style.setProperty(
                "--startX",
                `${sPosX}px`
            );


            skull.style.setProperty(
                "--startY",
                `${sPosY}px`
            );


            skull.style.setProperty(
                "--startAngle",
                `${sAngle}rad`
            );


            skull.classList.add(
                "skull-launching"
            );


            setTimeout(
                () => {

                    skull.classList.remove(
                        "skull-launching"
                    );


                    sPosX =
                        mouseX;


                    sPosY =
                        mouseY;


                    sAngle =
                        0;


                    isLaunching =
                        false;

                },

                5000

            );

        }
    );

}


/* ========================================
   TOTENKOPF-ANIMATION
   ======================================== */

function updateSkullBehavior() {

    /*
     Inaktiv oder gerade
     in Fluganimation.
    */

    if (
        !skullActive ||
        isLaunching
    ) {

        requestAnimationFrame(
            updateSkullBehavior
        );

        return;
    }


    if (!skull) {

        requestAnimationFrame(
            updateSkullBehavior
        );

        return;
    }


    /* ----------------------------------------
       KREISBEWEGUNG
       ---------------------------------------- */

    orbitAngle +=
        0.02;


    const orbitRadius =
        40;


    const sTargetX =

        mouseX +

        Math.cos(
            orbitAngle
        ) *

        orbitRadius -

        30;


    const sTargetY =

        mouseY +

        Math.sin(
            orbitAngle
        ) *

        orbitRadius -

        35;


    /* ----------------------------------------
       VERZÖGERTES FOLGEN
       ---------------------------------------- */

    const delay =
        25;


    const dx =
        sTargetX -
        sPosX;


    const dy =
        sTargetY -
        sPosY;


    sPosX +=
        dx / delay;


    sPosY +=
        dy / delay;


    /* ----------------------------------------
       DREHUNG
       ---------------------------------------- */

    if (
        Math.abs(dx) >
        0.5
    ) {

        sAngle +=
            (
                dx /
                delay
            ) *
            0.05;

    }


    skull.style.transform =

        `translate(
            ${sPosX}px,
            ${sPosY}px
        )
        rotate(
            ${sAngle}rad
        )`;


    /* ----------------------------------------
       AUGEN-BLINKEN
       ---------------------------------------- */

    eyeTimer++;


    if (
        eyeTimer >
        150
    ) {

        eyeTimer =
            0;


        if (
            Math.random() >
            0.4
        ) {

            eyesAreVisible =
                !eyesAreVisible;


            humanEyes.forEach(
                eye => {

                    eye.classList.toggle(
                        "visible",
                        eyesAreVisible
                    );

                }
            );

        }

    }


    /* ----------------------------------------
       IRIS-BEWEGUNG
       ---------------------------------------- */

    if (
        eyesAreVisible
    ) {

        const irisX =

            Math.cos(
                orbitAngle * 3
            ) *

            3;


        const irisY =

            Math.sin(
                orbitAngle * 3
            ) *

            3;


        irises.forEach(
            iris => {

                iris.style.transform =

                    `translate(
                        ${irisX}px,
                        ${irisY}px
                    )`;

            }
        );

    }


    /* ----------------------------------------
       NÄCHSTES BILD
       ---------------------------------------- */

    requestAnimationFrame(
        updateSkullBehavior
    );

}


/* ========================================
   ANIMATION STARTEN
   ======================================== */

requestAnimationFrame(
    updateSkullBehavior
);