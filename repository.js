const fs = require('fs');

class Repository {
    constructor(filename) {
      if (!filename) {
        throw new Error('Creating a repository requires a filename');
      }
      this.filename = filename;
      try {
        fs.accessSync(this.filename);
      } catch (err) {
        fs.writeFileSync(this.filename, '[]');
      }
    }
  }
  
  class MessagesRepository extends Repository {
    async create(attrs) {
      const records = await this.getAll();
      records.push(attrs.message);
      await fs.promises.writeFile(this.filename, JSON.stringify(records));
    }
  
    async getAll() {
      return JSON.parse(await fs.promises.readFile(this.filename, { encoding: 'utf8' }));
    }
  }
  
  const messagesRepo = new MessagesRepository('messages.json');