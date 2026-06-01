const express = require('express');
const router = express.Router();
const TastingNote = require('../models/TastingNote');
const TastingInfusion = require('../models/TastingInfusion');
const TeaProduct = require('../models/TeaProduct');
const { Op, fn, col } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, tea_product_id, start_date, end_date } = req.query;
    const where = {};
    
    if (tea_product_id) where.tea_product_id = tea_product_id;
    if (start_date) where.tasting_date = { [Op.gte]: start_date };
    if (end_date) where.tasting_date = { ...where.tasting_date, [Op.lte]: end_date };

    const offset = (page - 1) * pageSize;
    const { count, rows } = await TastingNote.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      include: [
        { model: TeaProduct, as: 'teaProduct' }
      ],
      order: [['tasting_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/conversion-curve/:tea_product_id', async (req, res) => {
  try {
    const { tea_product_id } = req.params;
    
    const notes = await TastingNote.findAll({
      where: { tea_product_id },
      include: [
        { 
          model: TastingInfusion, 
          as: 'tastingNote',
          separate: true,
          order: [['infusion_number', 'ASC']]
        },
        { model: TeaProduct, as: 'teaProduct' }
      ],
      order: [['tasting_date', 'ASC']]
    });

    const curveData = notes.map(note => {
      const infusions = note.tastingNote || [];
      const avgInfusionScore = infusions.length > 0
        ? infusions.reduce((sum, inf) => sum + parseFloat(inf.score), 0) / infusions.length
        : null;

      return {
        id: note.id,
        tasting_date: note.tasting_date,
        year: new Date(note.tasting_date).getFullYear(),
        overall_score: note.overall_score,
        avg_infusion_score: avgInfusionScore ? avgInfusionScore.toFixed(2) : null,
        brew_count: note.brew_count,
        notes: note.notes,
        tea_weight: note.tea_weight,
        water_type: note.water_type,
        infusions: infusions.map(inf => ({
          infusion_number: inf.infusion_number,
          soup_color: inf.soup_color,
          aroma: inf.aroma,
          taste: inf.taste,
          score: inf.score
        }))
      };
    });

    const teaProduct = notes.length > 0 ? notes[0].teaProduct : null;

    res.json({
      success: true,
      data: {
        tea_product: teaProduct,
        curve_data: curveData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await TastingNote.findByPk(req.params.id, {
      include: [
        { model: TeaProduct, as: 'teaProduct' },
        { 
          model: TastingInfusion, 
          as: 'tastingNote',
          order: [['infusion_number', 'ASC']]
        }
      ]
    });
    
    if (!note) {
      return res.status(404).json({ success: false, message: '品鉴笔记不存在' });
    }
    
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { infusions, ...noteData } = req.body;
    
    let overall_score = null;
    if (infusions && infusions.length > 0) {
      const totalScore = infusions.reduce((sum, inf) => sum + parseFloat(inf.score), 0);
      overall_score = (totalScore / infusions.length).toFixed(2);
    }
    
    const note = await TastingNote.create({ ...noteData, overall_score });
    
    if (infusions && infusions.length > 0) {
      const infusionData = infusions.map(inf => ({
        ...inf,
        tasting_note_id: note.id
      }));
      await TastingInfusion.bulkCreate(infusionData);
    }
    
    const result = await TastingNote.findByPk(note.id, {
      include: [
        { model: TeaProduct, as: 'teaProduct' },
        { 
          model: TastingInfusion, 
          as: 'tastingNote',
          order: [['infusion_number', 'ASC']]
        }
      ]
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await TastingNote.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: '品鉴笔记不存在' });
    }
    
    const { infusions, ...noteData } = req.body;
    
    let overall_score = note.overall_score;
    if (infusions && infusions.length > 0) {
      const totalScore = infusions.reduce((sum, inf) => sum + parseFloat(inf.score), 0);
      overall_score = (totalScore / infusions.length).toFixed(2);
    }
    
    await note.update({ ...noteData, overall_score });
    
    if (infusions) {
      await TastingInfusion.destroy({ where: { tasting_note_id: note.id } });
      
      if (infusions.length > 0) {
        const infusionData = infusions.map(inf => ({
          ...inf,
          tasting_note_id: note.id
        }));
        await TastingInfusion.bulkCreate(infusionData);
      }
    }
    
    const result = await TastingNote.findByPk(note.id, {
      include: [
        { model: TeaProduct, as: 'teaProduct' },
        { 
          model: TastingInfusion, 
          as: 'tastingNote',
          order: [['infusion_number', 'ASC']]
        }
      ]
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await TastingNote.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: '品鉴笔记不存在' });
    }
    
    await TastingInfusion.destroy({ where: { tasting_note_id: note.id } });
    await note.destroy();
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
