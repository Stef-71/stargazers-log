const repositoryList = document.querySelector("#repository-list");
const statusMessage = document.querySelector("#status");

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateString) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function isValidRepository(repository) {
  if (
    !repository ||
    typeof repository.repository !== "string" ||
    typeof repository.url !== "string" ||
    typeof repository.starredAt !== "string"
  ) {
    return false;
  }

  try {
    const url = new URL(repository.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }
  } catch {
    return false;
  }

  return formatDate(repository.starredAt) !== null;
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
    description.textContent = typeof repository.description === "string"
      ? repository.description
      : "";

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
  if (!repositoryList || !statusMessage) {
    console.error("Unable to load starred repositories: required page elements are missing.");
    return;
  }

  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories) || !repositories.every(isValidRepository)) {
      throw new TypeError("Repository data has an unexpected format.");
    }

    renderRepositories(repositories);
  } catch (error) {
    repositoryList.replaceChildren();
    statusMessage.textContent = "Could not load repositories. Please try again later.";
    console.error("Unable to load starred repositories:", error);
  }
}

loadRepositories();
