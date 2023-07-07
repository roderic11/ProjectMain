const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  createNewProject,
  getIDProjects,
 updateItemQuantity,
  updateProject,
  deleteProject,
} = require('../controllers/BillOfMaterialModel');

// GET /api/projects

router.get('/', getAllProjects);
router.get('/:id', getIDProjects);
// POST /api/projects
router.post('/', createNewProject);


// PATCH /api/projects/:projectId/items/:itemId/quantity
router.patch('/:projectId/items/:itemId/quantity', updateItemQuantity);

router.patch('/:id', updateProject);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);



module.exports = router;