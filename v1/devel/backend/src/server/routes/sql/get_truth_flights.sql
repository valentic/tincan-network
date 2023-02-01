-- Based on https://dba.stackexchange.com/questions/157191/how-to-convert-list-of-dates-to-list-of-date-ranges-grouped-by-a-condition

select json_agg(data) from (

    with 
        epochs as (
            select 
                row_number() over(order by timestamp) as rnum,
                extract(epoch from timestamp) as ts
            from
                truth_data as data
            join
                sites on sites.id=data.site_id
            where
                sites.name='{sitename}'
            order by 
                timestamp 
        ),

        flight_points as (
            select
                ts,
                floor((ts-(select min(ts) from epochs)-rnum+1)::numeric/60)*60 as grp
            from 
                epochs 
        )

    select
        row_number() over (order by min(ts)) as id,
        min(ts) as start_ts,
        max(ts) as stop_ts, 
        max(ts)-min(ts) as duration
    from
        flight_points
    group by 
        grp
    order by 
        start_ts 

) as data
