const questionInput = document.getElementById("questionInput");
const addOptionBtn = document.getElementById("addOptionBtn");
const createPollBtn = document.getElementById("createPollBtn");
const optionsContainer = document.getElementById("optionsContainer");
const pollList = document.getElementById("pollList");

let polls = JSON.parse(localStorage.getItem("polls")) || [];

// 選択肢追加
addOptionBtn.addEventListener("click", () => {
  const optionCount = document.querySelectorAll(".optionInput").length;
  if (optionCount >= 10) {
    alert("選択肢は最大10個までです");
    return;
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "optionInput";
  input.placeholder = `選択肢${optionCount + 1}`;
  optionsContainer.appendChild(input);
});

// 投票作成
createPollBtn.addEventListener("click", () => {
  const question = questionInput.value.trim();
  const optionInputs = document.querySelectorAll(".optionInput");

  if (!question) {
    alert("質問を入力してください");
    return;
  }

  const options = [];
  optionInputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      options.push({ text: value, votes: 0 });
    }
  });

  if (options.length < 2) {
    alert("選択肢は2つ以上必要です");
    return;
  }

  const newPoll = {
    id: Date.now(),
    question,
    options
  };

  polls.push(newPoll);
  savePolls();
  renderPolls();
  resetForm();
});

// 保存
function savePolls() {
  localStorage.setItem("polls", JSON.stringify(polls));
}

// 描画
function renderPolls() {
  pollList.innerHTML = "";

  polls.forEach(poll => {
    const card = document.createElement("div");
    card.className = "poll-card";

    const title = document.createElement("h3");
    title.textContent = poll.question;
    card.appendChild(title);

    poll.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = `${option.text} (${option.votes}票)`;

      btn.addEventListener("click", () => {
        vote(poll.id, index);
      });

      card.appendChild(btn);
    });

    pollList.appendChild(card);
  });
}

// 投票処理
function vote(pollId, optionIndex) {
  const votedKey = "voted_" + pollId;
  if (localStorage.getItem(votedKey)) {
    alert("この投票にはすでに投票しています");
    return;
  }

  const poll = polls.find(p => p.id === pollId);
  if (!poll) return;

  poll.options[optionIndex].votes++;
  localStorage.setItem(votedKey, "true");

  savePolls();
  renderPolls();
}

// フォームリセット
function resetForm() {
  questionInput.value = "";
  optionsContainer.innerHTML = `
    <input type="text" class="optionInput" placeholder="選択肢1">
    <input type="text" class="optionInput" placeholder="選択肢2">
  `;
}

renderPolls();
