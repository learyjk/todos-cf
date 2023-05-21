const form = document.querySelector("form");
if (!form) return;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const formData = new FormData(form);
  const title = formData.get("title");
  const completed = formData.get("completed") == "on";

  fetch(`http://127.0.0.1/todos/1234`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, completed }),
  });
});
