import express from 'express';
import db from '../knexfile.js';
import authenticate from '../authentication/authMiddleware.js';

const router = express.Router();

//POST /forms/:user_id
router.post('/:user_id', authenticate, async (req, res) => {
    const { user_id } = req.params;
    const { name, status, sections, design_object } = req.body;
  
    // Verify user
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }
  
    try {
      // Insert form
      await db('forms').insert({
        user_id: user_id,
        name,
        status,
        design_object: JSON.stringify(design_object),
        total_responses: 0,
        created: new Date(),
        updated: new Date(),
      });
  
      // Get the form id PLS
      const newFormId = await db.raw('SELECT LAST_INSERT_ID() AS form_id');
      const formId = newFormId[0][0].form_id;
  
      // Store form sections
      for (const section of sections) {
        await db('form_sections').insert({
          form_id: formId, 
          type: section.type,
          label: section.label,
          options: section.options ? JSON.stringify(section.options) : null,
          created: new Date(),
          updated: new Date(),
        });
      }
  
      // end
      res.status(201).json({ message: 'Form successfully created', form_id: newFormId[0].form_id });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Error creating form' });
    }
  });

  
//PUT /:user_id/forms/:id

//GET /:user_id/forms

//GET /:user_id/forms/:id

//GET /:user_id/forms/:id/responses

router.get('/', (_req, res) => {
    res.send('Hello World we up!');
  });

export default router;