class ProjectsService {
  public generateUniformProjectName(projectName: string) {
    const result = projectName
      .trim()
      .toLocaleLowerCase()
      .split(' ')
      .reduce((prev, curr, index) => {
        let res = '';
        if (index > 0) {
          res += '-';
        }
        return prev + res + curr;
      }, '');
    return result;
  }

  generateProjectPath(username, projectName) {
    return username + '/' + this.generateUniformProjectName(projectName);
  }
}

export default ProjectsService;
