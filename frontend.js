const getUserID = () => {
  const storedUserID = localStorage.getItem("user_id");
  if (storedUserID) {
    return storedUserID;
  }
  const user_id = crypto.randomUUID();
  localStorage.setItem("user_id", user_id);
  return user_id;
};

const loadTodos = async (user_id) => {
  const response = await fetch("http://127.0.0.1:8787/todos", {
    headers: {
      Authentication: `Bearer ${user_id}`,
    },
  });

  const data = (await response).json();
  return data;
};

const user_id = getUserID();
console.log({ user_id });

loadTodos(user_id).then((todos) => console.log(todos));

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const formData = new FormData(form);
  const title = formData.get("title");
  const completed = formData.get("completed") == "on";

  fetch(`http://127.0.0.1:8787/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authentication: `Bearer ${user_id}`,
    },
    body: JSON.stringify({ title, completed }),
  });
});
