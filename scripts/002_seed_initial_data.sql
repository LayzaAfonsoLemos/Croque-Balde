-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Baldes de Frango', 'Nossos famosos baldes de frango crocante', '/placeholder.svg?height=200&width=200'),
('Acompanhamentos', 'Deliciosos acompanhamentos para sua refeição', '/placeholder.svg?height=200&width=200'),
('Bebidas', 'Bebidas geladas para acompanhar', '/placeholder.svg?height=200&width=200'),
('Sobremesas', 'Doces para finalizar sua refeição', '/placeholder.svg?height=200&width=200');

-- Insert sample products
INSERT INTO public.products (category_id, name, description, price, image_url) VALUES
-- Baldes de Frango
((SELECT id FROM public.categories WHERE name = 'Baldes de Frango' LIMIT 1), 'Balde Familiar', '12 pedaços de frango crocante temperado com nossa receita especial', 45.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Baldes de Frango' LIMIT 1), 'Balde Médio', '8 pedaços de frango crocante', 32.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Baldes de Frango' LIMIT 1), 'Balde Individual', '4 pedaços de frango crocante', 18.90, '/placeholder.svg?height=300&width=300'),

-- Acompanhamentos
((SELECT id FROM public.categories WHERE name = 'Acompanhamentos' LIMIT 1), 'Batata Frita Grande', 'Porção generosa de batatas fritas crocantes', 12.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Acompanhamentos' LIMIT 1), 'Salada de Repolho', 'Salada cremosa de repolho tradicional', 8.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Acompanhamentos' LIMIT 1), 'Milho na Manteiga', 'Milho doce refogado na manteiga', 9.90, '/placeholder.svg?height=300&width=300'),

-- Bebidas
((SELECT id FROM public.categories WHERE name = 'Bebidas' LIMIT 1), 'Refrigerante 2L', 'Coca-Cola, Guaraná ou Fanta', 8.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Bebidas' LIMIT 1), 'Suco Natural 500ml', 'Laranja, Limão ou Maracujá', 6.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Bebidas' LIMIT 1), 'Água Mineral', 'Água mineral 500ml', 3.90, '/placeholder.svg?height=300&width=300'),

-- Sobremesas
((SELECT id FROM public.categories WHERE name = 'Sobremesas' LIMIT 1), 'Sorvete Casquinha', 'Sorvete cremoso na casquinha crocante', 7.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Sobremesas' LIMIT 1), 'Torta de Chocolate', 'Fatia de torta de chocolate com cobertura', 12.90, '/placeholder.svg?height=300&width=300'),
((SELECT id FROM public.categories WHERE name = 'Sobremesas' LIMIT 1), 'Pudim de Leite', 'Pudim caseiro com calda de caramelo', 9.90, '/placeholder.svg?height=300&width=300');
