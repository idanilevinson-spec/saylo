-- Real App Store Connect subscription product IDs, created under the
-- "Saylo Premium" subscription group (see migration 028 for the column).

update public.subscription_plans set apple_product_id = 'com.saylolearn.app.monthly' where code = 'monthly';
update public.subscription_plans set apple_product_id = 'com.saylolearn.app.bimonthly' where code = 'bimonthly';
update public.subscription_plans set apple_product_id = 'com.saylolearn.app.quarterly' where code = 'quarterly';
update public.subscription_plans set apple_product_id = 'com.saylolearn.app.biannual' where code = 'biannual';
update public.subscription_plans set apple_product_id = 'com.saylolearn.app.annual' where code = 'annual';
