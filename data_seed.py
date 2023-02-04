from typing import List, Dict

from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from project.database_common import connection_handler


def read_sql_file(filename):
    with open(filename, 'r') as file:
        return [coma.strip() + ';' for coma in (''.join([line for line in file.readlines() if line[0] != '-']).split(';'))]

@connection_handler
def run_sql_command(cursor, single_command):
    query = single_command
    cursor.execute(query)

def run_sql_commands():
    list_commands = read_sql_file('./project/data/initial-db.sql')
    for command in list_commands:
        if len(command) > 2:
            run_sql_command(command)