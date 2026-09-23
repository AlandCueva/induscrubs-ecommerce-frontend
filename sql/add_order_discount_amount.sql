-- Persist the VIP discount on the order so trg_enforce_order_total stops
-- resetting orders.total to the full price.

alter table public.orders
  add column discount_amount numeric(10,2) not null default 0;

-- Same logic as before (items + shipping), minus the discount.
create or replace function public.enforce_order_total()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  new.total := coalesce((
    select sum(quantity * unit_price_snapshot)
    from order_items
    where order_id = new.id
  ), 0) + coalesce(new.shipping_fee, 0) - coalesce(new.discount_amount, 0);
  return new;
end;
$function$;
