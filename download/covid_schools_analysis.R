library(tidyverse)
library(lubridate)

#load data
covid_dynamics <- read.csv("covid19_by_settlement_dynamics.csv", sep = ",", header = T, encoding = "UTF-8")

#convert date formats
covid_dynamics <- covid_dynamics %>% 
  mutate(zvit_date = ymd(zvit_date))

#get a range of dates
range(covid_dynamics$zvit_date)

#check region and district names
levels(as.factor(covid_dynamics$registration_area))
levels(as.factor(covid_dynamics$registration_region))

#remove and correct sove observations
covid_dynamics <- covid_dynamics %>% 
  filter(!registration_region %in% c("�����������")) %>%
  mutate(registration_region = gsub("��������������", "�������������", registration_region),
         registration_region = gsub("��������� �����", "����", registration_region),
         registration_region = gsub("������������ �����", replacement = "�����������", registration_region))

#summarise new cases for the last 14 days by region
new_cases <- covid_dynamics %>% filter(zvit_date >= max(zvit_date) - days(14)) %>%
  group_by(registration_area, registration_region) %>% 
  summarise(tot_number_new_cases = sum(new_confirm)*3)

#load population data
pop_data <- read.csv("Ukraine.csv", sep = ";", header = T, stringsAsFactors = F)

#remove settlement annotation
pop_data2 <- pop_data %>% mutate(name =  gsub("�\\. ", "", name)) %>% 
  mutate(name = gsub("��� ", "", name))

#calculate local prevalence
local_prevalence <- left_join(new_cases, pop_data2 %>% select(-code), 
                              by = c("registration_area" = "oblast", 
                                     "registration_region" = "name"))

#check NAs

#remove NAs (some small villages with a few cases and no pop data) and calculate local prevalence
local_prevalence <- local_prevalence %>% filter(!is.na(pop_number)) %>% 
  mutate(prob = tot_number_new_cases/as.numeric(pop_number))

#calculate potential number of infected people for schools with 100, 200, 500, 1000 people 
local_prevalence <- local_prevalence %>%
  mutate(infections100 = round(prob*100),
         infections200 = round(prob*200),
         infections500 = round(prob*500),
         infections1000 = round(prob*1000),
         pop_number = as.numeric(pop_number))

#write csv (MAP WITH REGIONS/CITIES)
write.table(local_prevalence, "MAP.csv", sep = ";", row.names = F) 

#load schools data
schools <- read.csv("schools.csv", sep = ";", header = T, stringsAsFactors = F)

#calculate total number of people, attending each school
schools$tot_people <- schools$teachers + schools$students + schools$technical

#trial matching
#tmp <- left_join(schools, local_prevalence %>% select(-c(6:9)), 
#                 by = c("region" = "registration_area", 
#                       "district_name" = "registration_region"))

#districtNAs <- tmp %>% filter(is.na(tot_number_new_cases))

#fix district names in schools
schools2 <- schools %>%
  mutate(region = gsub("���� ���", "�\\. ���", region)) %>%
  mutate(district_name = gsub("H�����������", "������������", district_name)) %>%
  mutate(district_name = gsub("���'������", "���������", district_name)) %>%
  mutate(district_name = gsub("��p�������� �����", "���'������� �����", district_name)) %>%
  mutate(district_name = gsub("���������(?!.)", "����'������� �����", district_name,  perl = T)) %>%
  mutate(district_name = gsub("����������� �����", "����'������� �����", district_name)) %>%
  mutate(district_name = gsub("���������-������������ �����", "���'������-������������ �����", district_name)) %>%
  mutate(district_name = gsub("�������", "��������� �����", district_name)) %>%
  mutate(district_name = gsub("���������� ����� ", "���������� �����", district_name)) %>%
  mutate(district_name = gsub("��������", "����'����", district_name)) %>%
  mutate(district_name = gsub("����������� ����� ", "����'������� �����", district_name)) %>%
  mutate(district_name = gsub("����������� ����� ", "����������� �����", district_name)) %>%
  mutate(district_name = gsub("�������-������� �����", "���'����-������� �����", district_name)) %>%
  mutate(district_name = gsub("�����(?!.)", "����������� �����", district_name, perl = T)) %>%
  mutate(district_name = gsub("ǳ�������� �����", "ǳ��������� �����", district_name)) %>%
  mutate(district_name = gsub("����", "�������� �����", district_name)) %>%
  mutate(district_name = gsub("������(?!.)", "����������� �����", district_name,  perl = T)) %>%
  mutate(district_name = gsub("��������(?!.)", "���'�����", district_name, perl = T)) %>%
  mutate(district_name = gsub("���������� �����", "���'������� �����", district_name)) %>%
  mutate(district_name = gsub("I���i������ �����", "����������� �����", district_name)) %>%
  mutate(district_name = gsub("�i���������� �����", "������������ �����", district_name)) %>%
  mutate(district_name = gsub("���������������i������ �����", "��������������������� �����", district_name)) %>%
  mutate(district_name = gsub("�������i������� �����", "�������������� �����", district_name)) %>%
  mutate(district_name = gsub("���i������� �����", "����������� �����", district_name)) %>%
  mutate(district_name = gsub("��������-����������(?!.)", "���'�����-����������", district_name, perl = T)) %>%
  mutate(district_name = gsub("��������-���������� �����", "���'�����-���������� �����", district_name)) %>%
  mutate(district_name = gsub("�������", "��������������� �����", district_name)) %>%
  mutate(district_name = gsub("³�������� �����", "³�������� �����", district_name)) %>%
  mutate(district_name = gsub("���������� �����", "���'������� �����", district_name))

#second try
#trial matching
tmp2 <- left_join(schools2, local_prevalence %>% select(-c(6:9)), 
                  by = c("region" = "registration_area", 
                         "district_name" = "registration_region"))

districtNAs2 <- tmp2 %>% filter(is.na(tot_number_new_cases))

#replace prob NAs with zeroes (no covid detected in those areas) and calculate potential number of infected people to show up
tmp2 <- tmp2 %>% mutate(prob = replace_na(prob, 0)) %>%
  mutate(pot_infections = round(prob*tot_people))

#write csv (TABLE)
table <- tmp2 %>% select(-c(4:6, 9))

write.table(table, "TABLE.csv", sep = ";", row.names = F, qmethod = "d")
