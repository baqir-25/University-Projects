class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }
}
module.exports = BaseRepository;