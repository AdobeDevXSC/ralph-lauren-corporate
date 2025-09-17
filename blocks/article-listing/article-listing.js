export default async function decorate(block) {
  const QUERY_PATH = '/articles/query-index.json';

  const linkEl = block.querySelector('a');
  let link = linkEl?.href || QUERY_PATH;

  const defaultContent = block.querySelector(':scope > div');
  defaultContent.classList.add('default-content-wrapper');

  if (link) {
    linkEl.parentElement.remove();
  } else {
    link = QUERY_PATH;
  }

  // Force relative path (avoids CORS issues between .aem.page and .ue.da.live)
  const url = new URL(`${link}`, window.location.origin);
  const relativePath = `${url.pathname}${url.search || ''}`;

  const response = await fetch(relativePath);
  if (!response.ok) throw new Error('Could not fetch query index');

  const { data } = await response.json();

  data.forEach((item, idx) => {
    // Format date (using lastModified timestamp if date is missing)
    const date = item.date
      ? new Date(item.date)
      : new Date(item.lastModified * 1000);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).toUpperCase();

    // Create wrapper
    const article = document.createElement('div');
    article.className = 'article-item';

    // Image
    // demo only-- hardcoded code
    const defaultImg = '/default-meta-image.png?width=1200&format=pjpg&optimize=medium';
    let img = '';

    if (item.image === defaultImg || item.image === '') {
      article.remove();
    } else {
      img = document.createElement('img');

      img.src = item.image;
      img.alt = item.title;
    }

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'article-content';

    // Title
    const title = document.createElement('a');
    title.href = item.path;
    title.textContent = item.title;
    title.className = 'article-title';

    // Date
    const dateEl = document.createElement('div');
    dateEl.className = 'article-date';
    dateEl.textContent = formattedDate;

    content.appendChild(title);
    content.appendChild(dateEl);

    // Download button
    const button = document.createElement('button');
    button.className = 'button secondary';
    button.innerHTML = 'Download';

    // Assemble
    if (img) article.appendChild(img);
    article.appendChild(content);
    article.appendChild(button);

    // Divider except last
    if (idx !== data.length - 1) {
      const divider = document.createElement('hr');
      divider.className = 'article-divider';
      block.appendChild(article);
      block.appendChild(divider);
    } else {
      block.appendChild(article);
    }
  });
}
