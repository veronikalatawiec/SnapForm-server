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
      res.status(201).json({form_id: formId });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Error creating form' });
    }
  });

  
//PUT /forms/:user_id/:id
router.put('/:user_id/:id', authenticate, async (req, res) => {
    const { user_id, id } = req.params;
    const { name, status, sections, design_object } = req.body;
  
    // Verify user
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }
  
    try {
      // update details pf form
      await db('forms')
        .where({ id: parseInt(id), user_id: parseInt(user_id) })
        .update({
          name,
          status,
          design_object: JSON.stringify(design_object),
        //   created: new Date(),
          updated: new Date(),
        });
  
      // remove old
      await db('form_sections')
        .where('form_id', id) 
        .del();
  
      // insert new fields
      for (const section of sections) {
        await db('form_sections').insert({
          form_id: parseInt(id),
          type: section.type,
          label: section.label,
          options: section.options ? JSON.stringify(section.options) : null,
          created: new Date(),
          updated: new Date(),
        });
      }
  
      // Res
      res.status(200).json({ message: 'Form successfully updated', form_id: id  });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Error updating form' });
    }
  });

//GET /forms/:user_id/
router.get('/:user_id', authenticate, async (req, res) => {
    const { user_id } = req.params;
  
    // Verify user
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }
  
    try {
      // get users forms
      const forms = await db('forms')
        .where({ user_id: parseInt(user_id) })
        .select('id as form_id', 'name', 'status', 'design_object', 'total_responses', 'created', 'updated');
  
      // no forms?
      if (forms.length === 0) {
        return res.status(200).json([]);
      }
  
      // get sections for this form
      for (let form of forms) {
        const sections = await db('form_sections')
          .where('form_id', form.form_id)
          .select('type', 'label', 'options');
          
        // Add sections
        form.sections = sections.map(section => ({
            type: section.type,
            label: section.label,
            options: section.options ? parseJSON(section.options) : null,
          }));
          
          // added because wrong format ruins everything
          function parseJSON(jsonString) {
            try {
              return JSON.parse(jsonString); // Try to parse
            } catch (e) {
              return jsonString; // If cant just return
            }
          }
        }
  
      // Return all
      res.status(200).json(forms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching forms' });
    }
  });

//GET /forms/live/:user_id/:id
router.get('/live/:user_id/:id', async (req, res) => {
  const { user_id, id } = req.params;

  try {
    // get form
    const form = await db('forms')
      .where({ user_id: parseInt(user_id), id: parseInt(id) })
      .first();
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // get sections
    const sections = await db('form_sections')
      .where('form_id', id)
      .select('type', 'label', 'options');

    res.status(200).json({sections, form}); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching form' }); 
  }
});

//GET /forms/:user_id/:id
router.get('/:user_id/:id', authenticate, async (req, res) => {
    const { user_id, id } = req.params;
  
    // Verify user
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }
  
    try {
      // Fetch specific form
      const form = await db('forms')
        .where({ user_id: parseInt(user_id), id: parseInt(id) })
        .first();
  
      // no form?
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
  
      // get sections
      const sections = await db('form_sections')
        .where('form_id', id)
        .select('type', 'label', 'options');

      // Return & res
      res.status(200).json({sections, form});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching form' });
    }
  });

//GET /forms/:user_id/:id/responses
router.get('/:user_id/forms/:form_id/responses', authenticate, async (req, res) => {
    const { user_id, form_id } = req.params;
  
    // Verify the user
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }
  
    try {
      // Fetch the form
      const form = await db('forms')
        .where({ user_id: parseInt(user_id), id: parseInt(form_id) })
        .first();
  
      // no form 
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
  
      // Fetch the form sections
      const formSections = await db('form_sections')
        .where('form_id', form_id)
        .select('id as form_section_id', 'type', 'label'); 
  
      // Fetch the responses 
      const responses = await db('form_responses')
        .join('form_sections', 'form_responses.form_section_id', '=', 'form_sections.id')
        .where('form_responses.form_id', form_id)
        .select('form_responses.id', 'form_responses.content', 'form_responses.created', 'form_sections.id as form_section_id', 'form_sections.label');
  
      // no responses?
      if (responses.length === 0) {
        return res.status(404).json({ message: 'No responses found for this form' });
      }
  
      // Format 
      const formattedResponses = responses.map(response => {
        const responseObj = { form_id: form_id };
        formSections.forEach((section, index) => {
          // name sections for response
          if (response.form_section_id === section.form_section_id) {
            responseObj[`section_${index + 1}`] = response.content;
          }
        });
  
        return responseObj;
      });
  
      // Return res
      res.status(200).json(formattedResponses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching form responses' });
    }
  });

// DELETE /forms/:user_id/:id
router.delete('/:user_id/:id', authenticate, async (req, res) => {
  const { user_id, id } = req.params;

  try {
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    // delete associated sections
    await db('form_sections')
      .where('form_id', parseInt(id))
      .del();

    // delete form
    const deletedForm = await db('forms')
      .where({ id: parseInt(id), user_id: parseInt(user_id) })
      .del();

    if (deletedForm === 0) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // succ
    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting form' });
  }
});

//POST /forms/response/:user_id/:id
router.post('/response/:user_id/:id', async (req, res) => {
  const { user_id, id } = req.params;
  const { responses } = req.body;

  try {
    const form = await db('forms')
      .where({ id: parseInt(id), user_id: parseInt(user_id) })
      .first();

    if (!form) {
      return res.status(404).json({ message: 'Form not found or not accessible.' });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const createdResponses = [];

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const { form_section_id, content } = response;

      // Insert the response data into the database
      await db('form_responses').insert({
        form_id: parseInt(id),  // Insert the form ID
        form_section_id: form_section_id,  // Insert the section ID
        content: content,  // The user's response
        created: currentDate, // Date of submission
      });

      // Optionally, fetch and store the inserted response if needed
      const insertedResponse = {
        form_section_id: form_section_id,
        content: content,
        created: currentDate,
      };

      createdResponses.push(insertedResponse);
    }

    // Send a success response with the created responses data
    res.status(200).json({ message: 'Responses submitted successfully', responses: createdResponses });

  } catch (error) {
    console.error('Error submitting form responses:', error);
    res.status(500).json({ message: 'Error processing your submission' });
  }
});


router.get('/', (_req, res) => {
    res.send('Hello World we up!');
  });

export default router;