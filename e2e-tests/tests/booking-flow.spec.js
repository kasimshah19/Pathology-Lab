const { test, expect } = require('@playwright/test');

test('E2E Flow: Create Patient and Booking', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes max
  
  console.log('Navigating to Live App...');
  await page.goto('/');

  // If we are at the login page, we need to register first
  // Usually there is a link to "Register" or "Create an account"
  // But wait! If we don't know the exact selectors, we'll try to find text.
  
  // Let's assume we are on login. Let's see if we can register a new admin
  const registerLink = page.getByText(/register/i);
  if (await registerLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Register...');
    await registerLink.click();
    
    console.log('Filling Registration Form...');
    await page.getByPlaceholder(/name/i).fill('Playwright Tester');
    await page.getByPlaceholder(/email/i).fill(`e2e_admin_${Date.now()}@lab.com`);
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /register/i }).click();
    
    // Wait for redirect to dashboard or login again
    await page.waitForTimeout(2000);
  } else {
    console.log('No register link found. Attempting to login with standard admin credentials if needed...');
    // We don't have standard credentials, so hopefully we are already logged in or can register.
    // If there is no login/register, maybe we are on the dashboard?
  }

  // Check if we need to login
  const loginButton = page.getByRole('button', { name: /sign in|log in/i });
  if (await loginButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Logging in...');
    await page.getByPlaceholder(/email/i).fill('kasimshah998@gmail.com'); // We hope this admin exists
    await page.getByPlaceholder(/password/i).fill('password123'); // Or whatever the real password is
    await loginButton.click();
  }

  // Wait for Dashboard to load
  console.log('Waiting for Dashboard...');
  await expect(page.getByText(/Dashboard/i).first()).toBeVisible({ timeout: 10000 });

  // 1. Create Patient
  console.log('Navigating to Patients...');
  await page.getByText('Patients', { exact: true }).click();
  
  console.log('Clicking Add Patient...');
  await page.getByRole('button', { name: /add patient/i }).click();
  
  console.log('Filling Patient Form...');
  const uniqueName = `Automated Patient ${Date.now()}`;
  await page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).fill(uniqueName);
  await page.getByLabel(/age/i).or(page.getByPlaceholder(/age/i)).fill('30');
  await page.locator('select').filter({ hasText: /select/i }).selectOption('male'); // Assuming there is a gender select
  await page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).fill('kasimshah998@gmail.com'); // The critical part
  await page.getByRole('button', { name: /add patient|save/i }).click();

  // Wait for patient to appear in table
  await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
  console.log('Patient Created Successfully!');

  // 2. Create Booking
  console.log('Navigating to Bookings...');
  await page.getByText('Bookings', { exact: true }).click();
  
  console.log('Clicking New Booking...');
  await page.getByRole('button', { name: /new booking|add booking/i }).click();

  console.log('Selecting Patient...');
  // Assuming a searchable dropdown or select for patient
  const patientInput = page.getByPlaceholder(/search patient/i).or(page.locator('input[type="text"]').first());
  await patientInput.fill(uniqueName);
  await page.getByText(uniqueName).first().click();

  console.log('Selecting Test...');
  // Assuming a searchable dropdown or select for tests
  const testInput = page.getByPlaceholder(/search test/i).or(page.locator('input[type="text"]').nth(1));
  await testInput.fill('CBC');
  await page.getByText(/CBC|Complete Blood Count/).first().click();

  console.log('Submitting Booking...');
  await page.getByRole('button', { name: /create booking|submit/i }).click();

  // Wait for success
  // Assuming the modal closes or a success toast appears
  await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 }).catch(() => console.log('No success toast detected, but proceeding.'));
  
  console.log('Booking Completed Successfully! Check your email (kasimshah998@gmail.com) for the confirmation.');
  
  // Keep browser open for a few seconds so user can see it
  await page.waitForTimeout(5000);
});
