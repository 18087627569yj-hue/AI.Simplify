-- ============================================================
-- 走马岭数字预运营系统 · 云数据库 schema
-- 在 Supabase 后台「SQL Editor」里整段粘贴并点 Run
-- ============================================================

-- 1) 节点主数据表（17 个景点 + 四线整合字段）
create table if not exists nodes (
  id            text primary key,
  no            int,
  name          text not null,
  cat           text,
  x             numeric,
  y             numeric,
  intro         text,
  district      text,
  building_type text,
  energy        text,
  role          text,
  story         text,
  updated_at    timestamptz default now()
);

-- 2) 行为事件表（每一次游客操作 = 一行）
create table if not exists events (
  id         bigint generated always as identity primary key,
  type       text not null,
  node_id    text,
  session_id text,
  value      jsonb,
  created_at timestamptz default now()
);
create index if not exists events_type_idx on events(type);
create index if not exists events_node_idx on events(node_id);
create index if not exists events_time_idx on events(created_at);

-- 3) 访问权限（演示用：节点公开可读，事件公开可读、可写）
alter table nodes  enable row level security;
alter table events enable row level security;
drop policy if exists "nodes public read"   on nodes;
drop policy if exists "events public read"   on events;
drop policy if exists "events public insert" on events;
create policy "nodes public read"    on nodes  for select using (true);
create policy "events public read"   on events for select using (true);
create policy "events public insert" on events for insert with check (true);

-- 4) 写入 17 个景点初始数据
insert into nodes (id, no, name, cat, x, y, intro) values
  ('yinjiashan', 1, '尹家山自然教育', 'scenic', 45.3, 9.4, '走马岭制高点自然教育节点，可俯瞰龙溪河流域全景与层叠梯田，是生态科普与登高揽胜的标志性位置。'),
  ('huanggeshu', 2, '黄葛树村落客厅', 'culture', 50.1, 17.3, '以百年黄葛树为中心的传统村落公共空间，兼具村民议事、游客歇脚与在地文化展示功能。'),
  ('yanxue', 3, '田园研学营地', 'activity', 64.9, 21.4, '以农耕文化与田园生活为主题的研学营地，可体验插秧、收割、手工制作等农事活动，配套室内课堂与营地住宿。'),
  ('caizhai', 4, '梯田采摘谷', 'activity', 49.3, 28, '依山势开垦的层叠梯田，种有荔枝、柑橘、时蔬等作物。游客可随季参与采摘，是走马岭农业体验的核心区域。'),
  ('guanjinghu', 5, '观景湖', 'activity', 76, 35.9, '山间天然湖泊，碧水环山，湖面倒映云影山色。沿湖设有亲水栈道与休憩亭台，是游览途中最宜舒缓停驻的自然景观。'),
  ('entry', 6, '游览入口', 'entry', 88.6, 30.6, '走马岭景区主入口，设有游客服务中心、导览牌、停车场与电瓶车接驳站，是全程游览的出发点。'),
  ('kangyang', 7, '康养门户', 'service', 81.4, 35.2, '以健康养生为主题的综合服务节点，提供中医理疗、茶歇休憩与健康咨询服务。'),
  ('guyizhan', 8, '走马古驿站', 'culture', 61.9, 39.7, '千年走马古道上的驿站遗址，石板路蜿蜒林间。沿途设共享驿站，游客与村民共享此段历史路径。'),
  ('matou', 9, '林家湾码头', 'culture', 43.2, 44, '龙溪河畔的传统渡口码头，保留有历史航运痕迹。现为水上游览的接驳节点与滨河休闲步道起点。'),
  ('tianyuancanting', 10, '田园餐厅', 'service', 65.7, 48.2, '以在地食材为主的田园餐饮空间，提供川东农家风味菜肴，兼顾游客餐饮与村民日常饮食需求。'),
  ('qinggang', 11, '青岗林场', 'culture', 72.4, 50.2, '原生态青岗林保护区域，林木苍翠，空气清新，是森林浴与林下漫步的理想去处。'),
  ('shuiguo', 12, '水果加工工坊', 'activity', 66.4, 58, '在地水果的深加工与体验空间，提供果酱制作、果干烘焙等手工体验，可购买特色伴手礼。'),
  ('zhuhai', 13, '竹海疗愈课堂', 'culture', 71.4, 61.3, '依托原生竹林设置的疗愈体验区，提供冥想、瑜伽、竹编手工等身心放松项目。'),
  ('minsu', 14, '滨水民宿', 'service', 59.9, 74.5, '改造传统民居而成的滨水精品住宿，提供留宿、特色餐饮与离园接驳服务。'),
  ('guanjingtai', 15, '观景台', 'scenic', 78.1, 72, '临崖架设的观景平台，俯瞰龙溪河东岸弯曲水道与对岸青山。日落时分光影层次丰富，视觉冲击力极强。'),
  ('binshuigongyuan', 16, '滨水公园', 'scenic', 60.5, 84.6, '依托龙溪河滨水地带打造的开放休闲公园，是亲水休憩与慢跑的好去处。'),
  ('binshuicanting', 17, '滨水餐厅', 'service', 64.2, 88.3, '位于景区南端滨水区域的景观餐厅，提供河鲜与农家菜，是全程游览的收尾节点。')
on conflict (id) do update set
  no = excluded.no, name = excluded.name, cat = excluded.cat,
  x = excluded.x, y = excluded.y, intro = excluded.intro;
