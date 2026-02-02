// Comprehensive testing scenarios for MCQ and dropdown form filling
import { OptionMatcher } from '../utils/option-matcher.js';
import { OptionMapper } from '../utils/option-mapper.js';
import { DropdownNavigator } from '../utils/dropdown-navigator.js';

export class FormFillTester {
  constructor() {
    this.optionMatcher = new OptionMatcher();
    this.optionMapper = new OptionMapper();
    this.dropdownNavigator = new DropdownNavigator();
    this.testResults = [];
    this.testScenarios = this.createTestScenarios();
  }

  createTestScenarios() {
    return {
      // Country selection tests
      countryTests: [
        {
          name: 'US Country Selection - Full Name',
          profileData: { country: 'United States' },
          question: { label: 'Country of Residence' },
          options: [
            { text: 'United States', value: 'US' },
            { text: 'Canada', value: 'CA' },
            { text: 'United Kingdom', value: 'UK' },
            { text: 'Germany', value: 'DE' }
          ],
          expected: { text: 'United States', confidence: 0.9 }
        },
        {
          name: 'US Country Selection - Code Format',
          profileData: { country: 'USA' },
          question: { label: 'Select your country' },
          options: [
            { text: 'USA', value: 'usa' },
            { text: 'CAN', value: 'can' },
            { text: 'GBR', value: 'gbr' },
            { text: 'DEU', value: 'deu' }
          ],
          expected: { text: 'USA', confidence: 0.9 }
        },
        {
          name: 'Country Selection - Mixed Formats',
          profileData: { country: 'United Kingdom' },
          question: { label: 'Nationality' },
          options: [
            { text: 'American', value: 'us' },
            { text: 'British', value: 'uk' },
            { text: 'Canadian', value: 'ca' },
            { text: 'German', value: 'de' }
          ],
          expected: { text: 'British', confidence: 0.8 }
        }
      ],

      // State selection tests
      stateTests: [
        {
          name: 'State Selection - Full Name',
          profileData: { state: 'California', country: 'United States' },
          question: { label: 'State/Province' },
          options: [
            { text: 'California', value: 'california' },
            { text: 'New York', value: 'new_york' },
            { text: 'Texas', value: 'texas' },
            { text: 'Florida', value: 'florida' }
          ],
          expected: { text: 'California', confidence: 0.9 }
        },
        {
          name: 'State Selection - Abbreviation',
          profileData: { state: 'NY', country: 'US' },
          question: { label: 'State' },
          options: [
            { text: 'CA', value: 'CA' },
            { text: 'NY', value: 'NY' },
            { text: 'TX', value: 'TX' },
            { text: 'FL', value: 'FL' }
          ],
          expected: { text: 'NY', confidence: 0.9 }
        }
      ],

      // Education level tests
      educationTests: [
        {
          name: 'Education Level - Bachelor Degree',
          profileData: { educationLevel: 'Bachelor Degree in Computer Science' },
          question: { label: 'Highest Education Level' },
          options: [
            { text: 'High School', value: 'high_school' },
            { text: 'Associate Degree', value: 'associate' },
            { text: 'Bachelor\'s Degree', value: 'bachelor' },
            { text: 'Master\'s Degree', value: 'master' },
            { text: 'Doctoral Degree', value: 'phd' }
          ],
          expected: { text: 'Bachelor\'s Degree', confidence: 0.8 }
        },
        {
          name: 'Education Level - PhD',
          profileData: { educationLevel: 'PhD in Physics' },
          question: { label: 'Education' },
          options: [
            { text: 'Undergraduate', value: 'undergrad' },
            { text: 'Graduate', value: 'grad' },
            { text: 'Postgraduate', value: 'postgrad' },
            { text: 'Doctorate', value: 'doctorate' }
          ],
          expected: { text: 'Doctorate', confidence: 0.8 }
        }
      ],

      // Employment/Industry tests
      employmentTests: [
        {
          name: 'Industry Selection - Technology',
          profileData: { industry: 'Software Development', jobTitle: 'Software Engineer' },
          question: { label: 'Industry' },
          options: [
            { text: 'Technology', value: 'tech' },
            { text: 'Healthcare', value: 'health' },
            { text: 'Finance', value: 'finance' },
            { text: 'Education', value: 'education' },
            { text: 'Retail', value: 'retail' }
          ],
          expected: { text: 'Technology', confidence: 0.8 }
        },
        {
          name: 'Employment Status',
          profileData: { employmentStatus: 'Full-time employed' },
          question: { label: 'Employment Status' },
          options: [
            { text: 'Employed full-time', value: 'ft' },
            { text: 'Employed part-time', value: 'pt' },
            { text: 'Self-employed', value: 'self' },
            { text: 'Unemployed', value: 'unemployed' },
            { text: 'Student', value: 'student' }
          ],
          expected: { text: 'Employed full-time', confidence: 0.8 }
        }
      ],

      // Gender selection tests
      genderTests: [
        {
          name: 'Gender Selection - Male',
          profileData: { gender: 'Male' },
          question: { label: 'Gender' },
          options: [
            { text: 'Male', value: 'M' },
            { text: 'Female', value: 'F' },
            { text: 'Other', value: 'O' },
            { text: 'Prefer not to say', value: 'N' }
          ],
          expected: { text: 'Male', confidence: 0.8 }
        },
        {
          name: 'Gender Selection - Title Based',
          profileData: { title: 'Mr.', firstName: 'John' },
          question: { label: 'Title' },
          options: [
            { text: 'Mr.', value: 'mr' },
            { text: 'Ms.', value: 'ms' },
            { text: 'Mrs.', value: 'mrs' },
            { text: 'Dr.', value: 'dr' }
          ],
          expected: { text: 'Mr.', confidence: 0.9 }
        }
      ],

      // Age range tests
      ageTests: [
        {
          name: 'Age Range - Specific Age',
          profileData: { age: 28, dateOfBirth: '1995-05-15' },
          question: { label: 'Age Range' },
          options: [
            { text: 'Under 18', value: 'u18' },
            { text: '18-24', value: '18-24' },
            { text: '25-34', value: '25-34' },
            { text: '35-44', value: '35-44' },
            { text: '45-54', value: '45-54' },
            { text: '55+', value: '55+' }
          ],
          expected: { text: '25-34', confidence: 0.9 }
        },
        {
          name: 'Age Range - Birth Year',
          profileData: { birthYear: 1990 },
          question: { label: 'What is your age group?' },
          options: [
            { text: 'Gen Z (born 1997-2012)', value: 'genz' },
            { text: 'Millennial (born 1981-1996)', value: 'millennial' },
            { text: 'Gen X (born 1965-1980)', value: 'genx' },
            { text: 'Baby Boomer (born 1946-1964)', value: 'boomer' }
          ],
          expected: { text: 'Millennial (born 1981-1996)', confidence: 0.8 }
        }
      ],

      // Language tests
      languageTests: [
        {
          name: 'Language Selection - English',
          profileData: { languages: ['English', 'Spanish'], primaryLanguage: 'English' },
          question: { label: 'Primary Language' },
          options: [
            { text: 'English', value: 'en' },
            { text: 'Spanish', value: 'es' },
            { text: 'French', value: 'fr' },
            { text: 'German', value: 'de' },
            { text: 'Chinese', value: 'zh' }
          ],
          expected: { text: 'English', confidence: 0.9 }
        },
        {
          name: 'Language Selection - Multiple Languages',
          profileData: { languages: 'English, French, German' },
          question: { label: 'Languages Spoken (select all that apply)' },
          options: [
            { text: 'English', value: 'en', type: 'checkbox' },
            { text: 'Spanish', value: 'es', type: 'checkbox' },
            { text: 'French', value: 'fr', type: 'checkbox' },
            { text: 'German', value: 'de', type: 'checkbox' },
            { text: 'Chinese', value: 'zh', type: 'checkbox' }
          ],
          expected: [
            { text: 'English', confidence: 0.9 },
            { text: 'French', confidence: 0.9 },
            { text: 'German', confidence: 0.9 }
          ]
        }
      ],

      // Income tests
      incomeTests: [
        {
          name: 'Income Range - Specific Amount',
          profileData: { income: 75000, salary: '$75,000' },
          question: { label: 'Annual Household Income' },
          options: [
            { text: 'Under $25,000', value: 'u25k' },
            { text: '$25,000 - $49,999', value: '25k-49k' },
            { text: '$50,000 - $74,999', value: '50k-74k' },
            { text: '$75,000 - $99,999', value: '75k-99k' },
            { text: '$100,000 - $149,999', value: '100k-149k' },
            { text: '$150,000+', value: '150k+' }
          ],
          expected: { text: '$75,000 - $99,999', confidence: 0.9 }
        }
      ],

      // Yes/No and Boolean tests
      booleanTests: [
        {
          name: 'Yes/No Question - Newsletter',
          profileData: { preferences: { newsletter: true, marketing: true } },
          question: { label: 'Would you like to receive our newsletter?' },
          options: [
            { text: 'Yes', value: 'yes' },
            { text: 'No', value: 'no' }
          ],
          expected: { text: 'Yes', confidence: 0.8 }
        },
        {
          name: 'Agreement Checkbox',
          profileData: { agreements: { terms: true } },
          question: { label: 'I agree to the terms and conditions', type: 'checkbox' },
          options: [
            { text: 'Agree', value: 'agree', checked: false }
          ],
          expected: { checked: true, confidence: 0.9 }
        }
      ],

      // Complex/Contextual tests
      contextualTests: [
        {
          name: 'Job Application - Experience Level',
          profileData: { 
            jobTitle: 'Senior Software Engineer', 
            yearsOfExperience: 8,
            skills: ['JavaScript', 'React', 'Node.js', 'Python'] 
          },
          question: { label: 'Experience Level' },
          options: [
            { text: 'Entry Level (0-2 years)', value: 'entry' },
            { text: 'Mid Level (3-5 years)', value: 'mid' },
            { text: 'Senior Level (6-10 years)', value: 'senior' },
            { text: 'Lead/Principal (10+ years)', value: 'lead' }
          ],
          expected: { text: 'Senior Level (6-10 years)', confidence: 0.9 }
        },
        {
          name: 'E-commerce - Shipping Preference',
          profileData: { 
            preferences: { fastShipping: true, expressDelivery: true },
            address: { country: 'US', state: 'CA' }
          },
          question: { label: 'Shipping Speed' },
          options: [
            { text: 'Standard (5-7 days)', value: 'standard' },
            { text: 'Express (2-3 days)', value: 'express' },
            { text: 'Overnight (1 day)', value: 'overnight' }
          ],
          expected: { text: 'Express (2-3 days)', confidence: 0.7 }
        }
      ]
    };
  }

  /**
   * Run all test scenarios
   * @returns {Object} Comprehensive test results
   */
  async runAllTests() {
    console.log('Starting comprehensive form fill tests...');
    
    this.testResults = [];
    const categories = Object.keys(this.testScenarios);
    
    for (const category of categories) {
      console.log(`\n--- Testing ${category} ---`);
      const tests = this.testScenarios[category];
      
      for (const test of tests) {
        try {
          const result = await this.runSingleTest(test, category);
          this.testResults.push(result);
          
          const status = result.passed ? '✓' : '✗';
          console.log(`${status} ${test.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
          
          if (!result.passed) {
            console.log(`   Expected: ${JSON.stringify(test.expected)}`);
            console.log(`   Got: ${JSON.stringify(result.actual)}`);
            console.log(`   Error: ${result.error}`);
          }
        } catch (error) {
          console.error(`Error running test ${test.name}:`, error);
          this.testResults.push({
            name: test.name,
            category: category,
            passed: false,
            error: error.message,
            actual: null
          });
        }
      }
    }
    
    return this.generateTestReport();
  }

  /**
   * Run a single test scenario
   * @param {Object} test - Test configuration
   * @param {string} category - Test category
   * @returns {Object} Test result
   */
  async runSingleTest(test, category) {
    const { name, profileData, question, options, expected } = test;
    
    try {
      // Test with OptionMatcher
      const matchResult = await this.optionMatcher.findBestMatch(
        { ...question, options }, 
        profileData,
        { useAI: false }
      );
      
      // Test with OptionMapper for specific field types
      let mapperResult = null;
      if (category.includes('country')) {
        mapperResult = this.optionMapper.mapToOption(
          profileData.country, 
          options, 
          'country'
        );
      } else if (category.includes('state')) {
        mapperResult = this.optionMapper.mapToOption(
          profileData.state, 
          options, 
          'state',
          { country: profileData.country }
        );
      }
      
      // Determine which result to use (prefer mapper for specific types)
      const result = mapperResult && mapperResult.confidence > matchResult.confidence 
        ? mapperResult 
        : matchResult;
      
      // Validate result
      const passed = this.validateTestResult(result, expected);
      
      return {
        name: name,
        category: category,
        passed: passed,
        actual: {
          option: result.option ? {
            text: result.option.text,
            value: result.option.value
          } : null,
          confidence: result.confidence,
          reasoning: result.reasoning
        },
        expected: expected,
        matcherUsed: mapperResult ? 'OptionMapper' : 'OptionMatcher'
      };
      
    } catch (error) {
      return {
        name: name,
        category: category,
        passed: false,
        error: error.message,
        actual: null
      };
    }
  }

  /**
   * Validate test result against expected outcome
   * @param {Object} result - Actual result
   * @param {Object} expected - Expected result
   * @returns {boolean} Whether test passed
   */
  validateTestResult(result, expected) {
    if (!result.option && !expected) {
      return true; // Both null/undefined
    }
    
    if (!result.option || !expected) {
      return false; // One is null, other isn't
    }
    
    // Handle array expectations (multiple selections)
    if (Array.isArray(expected)) {
      return expected.some(exp => 
        result.option.text === exp.text && 
        result.confidence >= (exp.confidence - 0.1)
      );
    }
    
    // Handle checkbox/boolean expectations
    if (expected.checked !== undefined) {
      return result.option.checked === expected.checked &&
             result.confidence >= (expected.confidence - 0.1);
    }
    
    // Standard text/value matching
    const textMatches = result.option.text === expected.text ||
                       result.option.value === expected.text ||
                       result.option.text === expected.value;
    
    const confidenceOk = result.confidence >= (expected.confidence - 0.1);
    
    return textMatches && confidenceOk;
  }

  /**
   * Generate comprehensive test report
   * @returns {Object} Test report with statistics
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    const categoryStats = {};
    const categories = [...new Set(this.testResults.map(r => r.category))];
    
    for (const category of categories) {
      const categoryTests = this.testResults.filter(r => r.category === category);
      const categoryPassed = categoryTests.filter(r => r.passed).length;
      
      categoryStats[category] = {
        total: categoryTests.length,
        passed: categoryPassed,
        failed: categoryTests.length - categoryPassed,
        passRate: Math.round((categoryPassed / categoryTests.length) * 100)
      };
    }
    
    const report = {
      summary: {
        totalTests: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: Math.round((passedTests / totalTests) * 100)
      },
      categoryBreakdown: categoryStats,
      failedTests: this.testResults
        .filter(r => !r.passed)
        .map(r => ({
          name: r.name,
          category: r.category,
          error: r.error,
          expected: r.expected,
          actual: r.actual
        })),
      detailedResults: this.testResults
    };
    
    console.log('\n=== TEST REPORT ===');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${report.summary.passRate}%)`);
    console.log(`Failed: ${failedTests}`);
    
    console.log('\nCategory Breakdown:');
    for (const [category, stats] of Object.entries(categoryStats)) {
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${stats.passRate}%)`);
    }
    
    if (failedTests > 0) {
      console.log('\nFailed Tests:');
      report.failedTests.forEach(test => {
        console.log(`  - ${test.name} (${test.category}): ${test.error || 'Assertion failed'}`);
      });
    }
    
    return report;
  }

  /**
   * Create mock HTML elements for testing dropdown interactions
   * @param {string} type - Type of dropdown to create
   * @param {Array} options - Options for the dropdown
   * @returns {HTMLElement} Mock dropdown element
   */
  createMockDropdown(type, options) {
    const container = document.createElement('div');
    
    switch (type) {
      case 'select':
        const select = document.createElement('select');
        select.id = 'test-select';
        select.name = 'test-field';
        
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value || opt.text;
          option.textContent = opt.text;
          select.appendChild(option);
        });
        
        container.appendChild(select);
        break;
        
      case 'react-select':
        container.className = 'react-select';
        container.innerHTML = `
          <div class="react-select__control">
            <div class="react-select__value-container">
              <input class="react-select__input" role="combobox" aria-autocomplete="list">
            </div>
          </div>
          <div class="react-select__menu" style="display: none;">
            ${options.map(opt => 
              `<div class="react-select__option" data-value="${opt.value}">${opt.text}</div>`
            ).join('')}
          </div>
        `;
        break;
        
      case 'bootstrap':
        container.className = 'dropdown';
        container.innerHTML = `
          <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">
            Select Option
          </button>
          <div class="dropdown-menu">
            ${options.map(opt => 
              `<a class="dropdown-item" data-value="${opt.value}">${opt.text}</a>`
            ).join('')}
          </div>
        `;
        break;
        
      default:
        container.className = 'custom-dropdown';
        container.innerHTML = `
          <div class="dropdown-trigger" role="button">Select Option</div>
          <div class="dropdown-options" role="listbox">
            ${options.map(opt => 
              `<div class="option" role="option" data-value="${opt.value}">${opt.text}</div>`
            ).join('')}
          </div>
        `;
    }
    
    return container;
  }

  /**
   * Test dropdown navigation functionality
   * @returns {Object} Navigation test results
   */
  async testDropdownNavigation() {
    const navigationTests = [
      {
        name: 'Standard Select Navigation',
        type: 'select',
        options: [
          { text: 'Option 1', value: '1' },
          { text: 'Option 2', value: '2' },
          { text: 'Option 3', value: '3' }
        ]
      },
      {
        name: 'React Select Navigation', 
        type: 'react-select',
        options: [
          { text: 'React Option 1', value: 'r1' },
          { text: 'React Option 2', value: 'r2' }
        ]
      },
      {
        name: 'Bootstrap Dropdown Navigation',
        type: 'bootstrap', 
        options: [
          { text: 'Bootstrap Option 1', value: 'b1' },
          { text: 'Bootstrap Option 2', value: 'b2' }
        ]
      }
    ];
    
    const results = [];
    
    for (const test of navigationTests) {
      try {
        // Create mock dropdown
        const mockDropdown = this.createMockDropdown(test.type, test.options);
        document.body.appendChild(mockDropdown);
        
        // Analyze dropdown
        const dropdownInfo = this.dropdownNavigator.analyzeDropdown(mockDropdown);
        
        // Test opening
        const openResult = await this.dropdownNavigator.openDropdown(dropdownInfo);
        
        // Test option retrieval
        const options = await this.dropdownNavigator.getDropdownOptions(dropdownInfo);
        
        // Test selection
        let selectResult = false;
        if (options.length > 0) {
          selectResult = await this.dropdownNavigator.selectOption(dropdownInfo, options[0]);
        }
        
        // Clean up
        document.body.removeChild(mockDropdown);
        
        results.push({
          name: test.name,
          type: test.type,
          analyzed: dropdownInfo.type !== 'unknown',
          opened: openResult,
          optionsFound: options.length,
          selected: selectResult,
          passed: dropdownInfo.type !== 'unknown' && options.length > 0
        });
        
      } catch (error) {
        results.push({
          name: test.name,
          type: test.type,
          error: error.message,
          passed: false
        });
      }
    }
    
    return {
      navigationTests: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length
      }
    };
  }

  /**
   * Run performance benchmarks
   * @returns {Object} Performance test results
   */
  async runPerformanceTests() {
    const performanceTests = [
      {
        name: 'Large Option Set (1000 options)',
        optionCount: 1000,
        profileData: { country: 'United States' }
      },
      {
        name: 'Complex Profile Data',
        optionCount: 50,
        profileData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          industry: 'Technology',
          jobTitle: 'Software Engineer',
          educationLevel: 'Bachelor Degree',
          languages: ['English', 'Spanish', 'French'],
          skills: ['JavaScript', 'Python', 'React', 'Node.js'],
          interests: ['Technology', 'Sports', 'Reading']
        }
      }
    ];
    
    const results = [];
    
    for (const test of performanceTests) {
      // Generate test options
      const options = Array.from({ length: test.optionCount }, (_, i) => ({
        text: `Option ${i + 1}`,
        value: `opt_${i + 1}`
      }));
      
      // Add target option
      if (test.profileData.country) {
        options.push({ text: 'United States', value: 'US' });
      }
      
      const startTime = performance.now();
      
      try {
        const result = await this.optionMatcher.findBestMatch(
          { label: 'Test Field', options },
          test.profileData,
          { useAI: false }
        );
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        results.push({
          name: test.name,
          duration: Math.round(duration),
          optionCount: test.optionCount,
          found: result.option !== null,
          confidence: result.confidence,
          passed: duration < 1000 // Should complete within 1 second
        });
        
      } catch (error) {
        results.push({
          name: test.name,
          error: error.message,
          passed: false
        });
      }
    }
    
    return {
      performanceTests: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        averageDuration: Math.round(
          results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length
        )
      }
    };
  }

  /**
   * Run all tests including unit, integration, navigation, and performance
   * @returns {Object} Complete test suite results
   */
  async runCompleteSuite() {
    console.log('Running complete test suite...');
    
    const unitTests = await this.runAllTests();
    const navigationTests = await this.testDropdownNavigation();
    const performanceTests = await this.runPerformanceTests();
    
    return {
      unitTests,
      navigationTests,
      performanceTests,
      overallSummary: {
        totalTests: unitTests.summary.totalTests + 
                   navigationTests.summary.total + 
                   performanceTests.summary.total,
        totalPassed: unitTests.summary.passed + 
                    navigationTests.summary.passed + 
                    performanceTests.summary.passed,
        overallPassRate: Math.round(
          ((unitTests.summary.passed + navigationTests.summary.passed + performanceTests.summary.passed) / 
           (unitTests.summary.totalTests + navigationTests.summary.total + performanceTests.summary.total)) * 100
        )
      }
    };
  }
}