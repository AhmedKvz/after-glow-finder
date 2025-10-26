-- Add more popular Belgrade venues
INSERT INTO public.venues (name, address, city, lat, lng) VALUES
  ('Kult', 'Bulevar kralja Aleksandra 43', 'Belgrade', 44.8075, 20.4801),
  ('Karmakoma', 'Karađorđeva 49', 'Belgrade', 44.8158, 20.4435),
  ('Hangar', 'Bulevar Arsenija Čarnojevića 90', 'Belgrade', 44.8041, 20.4197),
  ('Barutana', 'Topčiderski park', 'Belgrade', 44.7851, 20.4512),
  ('Mr Stefan Braun', 'Kralja Petra 13', 'Belgrade', 44.8186, 20.4551),
  ('Mint', 'Pariska 1', 'Belgrade', 44.8189, 20.4583),
  ('Gadost', 'Karadjordjeva 14', 'Belgrade', 44.8174, 20.4505),
  ('Cetinjska Vila', 'Cetinjska 15', 'Belgrade', 44.8013, 20.4752)
ON CONFLICT DO NOTHING;