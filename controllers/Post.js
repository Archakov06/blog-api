const Joi = require('joi');
const path = require('path');
const validator = require('validator');
const { Post } = require('../models/Post');
const { entityPaginate } = require('../utils/entityPaginate');

const checkPostBody = Joi.object({
  title: Joi.string().required().min(3).max(256),
  text: Joi.string().required().min(3).max(65536),
  description: Joi.string().required().min(3).max(400),
  photoUrl: Joi.string().min(3).max(100),
  user: Joi.string().required().length(24),
});

module.exports.all = async (req, res) => {
  try {
    const result = await entityPaginate(Post, req);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Произошла серверная ошибка' });
  }
};

module.exports.create = async (req, res) => {
  const { title, text, photoUrl, description } = req.body;
  const data = {
    title,
    text,
    description,
    photoUrl,
    user: req.userId,
  };
  const { error } = checkPostBody.validate(data);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
  } else {
    const post = new Post(data);
    try {
      const result = await post.save();
      if (result) {
        return res.status(201).json(result);
      }
      return res.status(400).json({ error: 'Не удалось создать запись' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Произошла серверная ошибка' });
    }
  }
};

module.exports.upload = async (req, res) => {
  if (!req.files.file) {
    res.status(400).send('Нет файла для загрузки');
    return;
  }

  const { file } = req.files;
  const uploadPath = [process.cwd(), '/public/uploads', file.md5 + '_' + file.name].join('/');

  file.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.json({ url: uploadPath.split('/public')[1] });
  });
};

module.exports.show = async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    res.status(400).json({ error: 'Неверный ID записи' });
  } else {
    try {
      Post.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }, { new: true }, async (err) => {
        if (err) {
          return res.status(500).json({ errors: err });
        }

        console.log(123123);
        const result = await Post.findById(id).populate('user');

        if (result) {
          return res.status(200).json(result);
        }

        res.status(404).json({ error: 'Такой записи нет в базе' });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Произошла серверная ошибка' });
    }
  }
};

module.exports.update = async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    res.status(400).json({ error: 'Неверный ID записи' });
  } else {
    const { title, text, photoUrl, description } = req.body;
    const data = {
      title,
      text,
      photoUrl,
      description,
      user: req.userId,
    };
    const { error } = checkPostBody.validate(data);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
    } else {
      try {
        const result = await Post.findByIdAndUpdate(id, { $set: data });
        if (result) {
          return res.status(202).json();
        }
        return res.status(404).json({ error: '123Такой записи нет в базе' });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Произошла серверная ошибка' });
      }
    }
  }
};

module.exports.delete = async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    res.status(400).json({ error: 'Неверный ID записи' });
  } else {
    try {
      const result = await Post.findByIdAndDelete(id);
      if (result) {
        return res.status(202).json();
      }
      return res.status(404).json({ error: 'Такой записи нет в базе' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Произошла серверная ошибка' });
    }
  }
};
