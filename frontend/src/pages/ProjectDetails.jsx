import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ProjectDetails.css';


const ProjDetails = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [category, setCategory] = useState('');
  const [existingCategories, setExistingCategories] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [existingSubCategories, setExistingSubCategories] = useState([
    { subCategory: '' },
  ]);
  const [arbitraryValues, setArbitraryValues] = useState({});
  const [scopeTotal, setScopeTotal] = useState({});
  const [ManualWeights, setManualWeights] = useState({});

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`/api/BillofMats/${id}`);
        const itemsData = response.data;
        setItems(itemsData);

        const categories = itemsData.map((item) => item.category);
        const subCategories = itemsData.map((item) => item.subCategory);
        setExistingCategories(categories);
        setExistingSubCategories(subCategories);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setError('Error fetching project details.');
        setLoading(false);
      }
    };

    fetchItems();
  }, [id]);

  useEffect(() => {
    const productOptions = items.map((item) => item.product);
    setProductOptions(productOptions);
  }, [items]);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleProductChange = (event, index) => {
    const updatedItems = [...items];
    updatedItems[index].product = event.target.value;
    setItems(updatedItems);
  };

  const handleQuantityChange = (event, index) => {
    const updatedItems = [...items];
    updatedItems[index].installed = event.target.value;
    setItems(updatedItems);
  };

  const handleSave = () => {
    // Match product name and save quantity under Total Installed
    const updatedItems = items.map((item) => {
      const installedItem = items.find((installed) => installed.product === item.product);
      return {
        ...item,
        totalInstalled: installedItem ? installedItem.installed : 0,
      };
    });
    setItems(updatedItems);
  };

  const calculateItemCompletion = (item) => {
    if (item.fixedQuantity && item.installed) {
      return ((item.installed * 100) / item.fixedQuantity).toFixed(2);
    }
    return '0.00';
  };

  const calculateOverallCompletion = (item) => {
    const itemCompletion = parseFloat(calculateItemCompletion(item));
    const weightPercentage = item.weightPercentage ? parseFloat(item.weightPercentage) : 0;
    return ((itemCompletion * weightPercentage) / 100).toFixed(2);
  };

  const TotalOverallCompletion = (subCategory) => {
    const itemsForSubCategory = items.filter((item) => item.subCategory === subCategory);
    const totalOverallCompletion = itemsForSubCategory.reduce((sum, item) => {
      const overallCompletion = calculateOverallCompletion(item);
      return sum + parseFloat(overallCompletion);
    }, 0);

    return totalOverallCompletion.toFixed(2);
  };

  const TotalWeightPercentage = (subCategory) => {
    const itemsForSubCategory = items.filter((item) => item.subCategory === subCategory);
    const totalWeightPercentage = itemsForSubCategory.reduce((sum, item) => {
      const weightPercentage = item.weightPercentage ? parseFloat(item.weightPercentage) : 0;
      return sum + weightPercentage;
    }, 0);

    return totalWeightPercentage.toFixed(2);
  };

  const calculateScopeTotal = (subCategory) => {
    const arbitraryValue = parseFloat(arbitraryValues[subCategory]) || 0;
    const totalOverallCompletion = parseFloat(TotalOverallCompletion(subCategory)) || 0;
    const scopeTotal = (arbitraryValue * totalOverallCompletion) / 100;
    return scopeTotal.toFixed(2);
  };

  const handleArbitraryValueChange = (event, subCategory) => {
    const updatedArbitraryValues = { ...arbitraryValues };
    updatedArbitraryValues[subCategory] = event.target.value;
    setArbitraryValues(updatedArbitraryValues);

    const updatedScopeTotal = { ...scopeTotal };
    updatedScopeTotal[subCategory] = calculateScopeTotal(subCategory);
    setScopeTotal(updatedScopeTotal);
  };

  const handleManualWeights = (event, category) => {
    const updatedManualWeights = { ...ManualWeights };
    updatedManualWeights[category] = event.target.value;
    setManualWeights(updatedManualWeights);
  };

  return (
    <div className="body1">
      <h1 className="top1">Bill of Materials: {id}</h1>

      <button onClick={handleGoBack}>Go Back</button>

      <table className="top3">
        <thead>
          <tr>
            <th>Product</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Weight %</th>
            <th>Total Installed</th>
            <th>Item Completion</th>
            <th>Overall Completion</th>
          </tr>
        </thead>
        <tbody>
          {items.reduce((acc, item, index) => {
            const categoryIndex = acc.findIndex((group) => group.category === item.category);
            const subCategoryIndex =
              categoryIndex > -1
                ? acc[categoryIndex].subCategories.findIndex(
                    (subGroup) => subGroup.subCategory === item.subCategory
                  )
                : -1;

            if (categoryIndex === -1 || subCategoryIndex === -1) {
              const newCategory = {
                category: item.category,
                subCategories: [
                  {
                    subCategory: item.subCategory,
                    items: [item],
                  },
                ],
              };
              acc.push(newCategory);
            } else {
              acc[categoryIndex].subCategories[subCategoryIndex].items.push(item);
            }

            return acc;
          }, []).map((categoryGroup) => (
            <React.Fragment key={categoryGroup.category}>
              {categoryGroup.category && (
                <tr>
                  <td colSpan="7">
                    <h2>{categoryGroup.category}</h2>
                    <input
                      type="number"
                      value={ManualWeights[categoryGroup.category] || ''}
                      onChange={(event) =>
                        handleManualWeights(event, categoryGroup.category)
                      }
                      placeholder="Insert Weights" // Add this line
                  />
                  </td>
                </tr>
              )}
              {categoryGroup.subCategories.map((subCategoryGroup, subCategoryIndex) => (
                <React.Fragment key={subCategoryGroup.subCategory}>
                  {subCategoryGroup.subCategory && (
                    <tr>
                      <td colSpan="7">
                        <h4>{subCategoryGroup.subCategory}</h4>
                        <td>
                        <input
                          type="number"
                          value={arbitraryValues[subCategoryGroup.subCategory] || ''}
                          onChange={(event) =>
                            handleArbitraryValueChange(event, subCategoryGroup.subCategory)
                          }
                          placeholder="Insert Arbitrary Value" // Add this line
                        />
                                                </td>
                        <td>{TotalWeightPercentage(subCategoryGroup.subCategory)}%</td>
                        <td>{TotalOverallCompletion(subCategoryGroup.subCategory)}%</td>
                        <td>{scopeTotal[subCategoryGroup.subCategory] || '0.00'}</td>
                      </td>
                    </tr>
                  )}
                  {subCategoryGroup.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product}</td>
                      <td>{item.unit}</td>
                      <td>{item.fixedQuantity}</td>
                      <td>
                        <input
                          type="number"
                          value={item.weightPercentage}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[index].weightPercentage = e.target.value;
                            setItems(updatedItems);
                          }}
                        />
                      </td>
                      <td>{item.totalInstalled}</td>
                      <td>{calculateItemCompletion(item)}%</td>
                      <td>{calculateOverallCompletion(item)}%</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <h2>Material Installed</h2>
      <table className="table-installed">
        <thead>
          <tr>
            <th>Product</th>
            <th>Unit</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <select
                  value={item.product}
                  onChange={(event) => handleProductChange(event, index)}
                >
                  <option value="">Select a product</option>
                  {productOptions.map((product, i) => (
                    <option key={i} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </td>
              <td>{item.unit}</td>
              <td>
                <input
                  type="number"
                  value={item.installed}
                  onChange={(event) => handleQuantityChange(event, index)}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="3">
              <button onClick={handleSave}>Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProjDetails;