const asyncHandler = require('express-async-handler');
const Project = require('../models/BillOfMaterialModel');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');


// @desc    Get all projects
// @route   GET /api/projects
// @access  Private

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().lean();
  res.status(200).json(projects);
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const getIDProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const project = await Project.findById(id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project.items); // Return only the 'items' array of the project
});



const createNewProject = asyncHandler(async (req, res) => {
  const { name, location, subject, product, quantity, unit,category, subCategory, fixedQuantity } = req.body;

  // Confirm data
  if (!name || !location || !subject) {
    return res.status(400).json({ message: 'Name, location, and subject are required fields' });
  }

  try {
    const projectId = uuidv4(); // Generate a unique identifier for the project

    // Create and store the new project
    const newProject = await Project.create({
      projectId,
      name,
      location,
      subject,
      category,
      subCategory,
      product,
      unit,
      quantity,
      fixedQuantity:quantity,
     
    });

    if (newProject) {
      return res.status(201).json({ message: 'New project created', project: newProject });
    } else {
      return res.status(400).json({ message: 'Failed to create project' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

//---------------------------------

// bomController.js
const updateItemQuantity = asyncHandler(async (req, res) => {
  const { projectId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const project = await Project.findById(projectId).exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const itemToUpdate = project.items.find(item => item._id.toString() === itemId);

    if (!itemToUpdate) {
      return res.status(404).json({ message: 'Item not found in BOM' });
    }

    // Update the item quantity
    itemToUpdate.quantity = quantity;

    const updatedProject = await project.save();

    res.json({ message: 'Item quantity updated', item: itemToUpdate, project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



//------------------------
// @route   PATCH /api/projects/:id
// @access  Private
// @route   PATCH /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { product, quantity, unit } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id).exec();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newItem = {
      product,
      unit,
      quantity,
      fixedQuantity: quantity, // Assign the quantity to fixedQuantity
    };

    project.items.push(newItem);
    const updatedProject = await project.save();

    res.json({ message: 'Item added to BOM', project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'Project ID required' });
  }

  const project = await Project.findById(id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  }

  await project.deleteOne();

  res.json({ message: 'Project deleted' });
});
// Import necessary dependencies and models
// elementsController.js


// POST route to add a new product to an existing project

const getObjectAdd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { product, quantity, unit} = req.body;

  // Confirm data
  if (!product || !quantity || !unit) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const project = await Project.findById(id).exec();

  if (!project) {
    return res.status(400).json({ message: 'Project not found' });
  }

  // Add the new product to the project
  const newProduct = {
    product: product,
    quantity: quantity,
    fixedQuantity:quantity,
    unit: unit,
  };

  project.products.push(newProduct);

  const updatedProject = await project.save();

  res.json({ message: 'Product added to project', project: updatedProject });
});





module.exports = {
  getAllProjects,
  createNewProject,
  updateProject,
  deleteProject,
  getObjectAdd ,
  getIDProjects,
  updateItemQuantity,
};