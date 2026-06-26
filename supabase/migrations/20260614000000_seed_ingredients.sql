INSERT INTO public.ingredients (name, category, default_shelf_life_days) VALUES
('Spinach', 'Greens', 4),
('Milk', 'Dairy', 7),
('Bread', 'Grains', 5),
('Chicken', 'Proteins', 3),
('Cilantro', 'Herbs', 4),
('Apples', 'Fruits', 14),
('Onions', 'Vegetables', 30),
('Potatoes', 'Vegetables', 45),
('Eggs', 'Dairy', 21),
('Carrots', 'Vegetables', 14),
('Broccoli', 'Vegetables', 7),
('Lemons', 'Fruits', 14),
('Garlic', 'Vegetables', 60)
ON CONFLICT (name) DO NOTHING;
