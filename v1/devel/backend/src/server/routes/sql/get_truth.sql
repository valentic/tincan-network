select json_agg(data) from
(
    select
        data.id,
        extract(epoch from timestamp) as timestamp,
        round(r::numeric,2) as r, 
        round(az::numeric,4) as az, 
        round(el::numeric,4) as el, 
        round(rdot::numeric,2) as rdot, 
        round(azdot::numeric,4) as azdot, 
        round(eldot::numeric,4) as eldot 
    from
        truth_data as data
    join
        sites on sites.id=data.site_id
    where
        sites.name='{sitename}'
    order by
        timestamp
) as data
