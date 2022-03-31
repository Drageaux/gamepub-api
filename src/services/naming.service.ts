class NamingService {
  // function to slugify a name
  public slugify(text: string, size = 70) {
    return text
      .toLocaleLowerCase()
      .replace(/\s+/g, '-') // convert to single space
      .slice(0, size) // truncate
      .replace(/(^-+)|[^a-zA-Z0-9- ]|(-+$)/g, '') // remove all leading and trailling hyphens
      .replace(/^-+|-+$|-+/g, '-'); // only get single hyphens
  }
}

export default NamingService;
