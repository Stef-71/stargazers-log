const repositoryList = document.querySelector("#repository-list");
const statusMessage = document.querySelector("#status");

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function renderRepositories(repositories) {
  repositoryList.replaceChildren();

  for (const repository of repositories) {
    const item = document.createElement("li");
    item.className = "repository-item";

    const link = document.createElement("a");
    link.className = "repository-name";
    link.href = repository.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = repository.repository;

    const description = document.createElement("p");
    description.className = "repository-description";
    description.textContent = repository.description;

    const date = document.createElement("time");
    date.className = "repository-date";
    date.dateTime = repository.starredAt;
    date.textContent = `Starred ${formatDate(repository.starredAt)}`;

    item.append(link, description, date);
    repositoryList.append(item);
  }

  statusMessage.textContent = repositories.length
    ? `${repositories.length} repositories`
    : "No starred repositories yet.";
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const repositories = await response.json();
    renderRepositories(repositories);
  } catch (error) {
    statusMessage.textContent = "Could not load repositories. Please try again later.";
    console.error("Unable to load starred repositories:", error);
  }
}

loadRepositories();